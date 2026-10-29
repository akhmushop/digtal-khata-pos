import { SignJWT, jwtVerify } from "jose";
import { and, desc, eq, gt, inArray, isNull } from "drizzle-orm";
import { db } from "../../db/schema/index.js";
import { users } from "../../db/schema/users.js";
import { refreshTokens } from "../../db/schema/refreshTokens.js";
import { emailVerificationTokens } from "../../db/schema/emailVerificationTokens.js";
import { env } from "../../config/env.js";
import { generateOpaqueToken, hashToken } from "../../utils/tokens.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import {
  addDays,
  computeSubscriptionState,
  type SubscriptionState,
} from "../../utils/subscription.js";
import {
  ConflictError,
  UnauthorizedError,
} from "../../utils/handleError.js";
import { businesses } from "../../db/schema/businesses.js";
import { businessMemberships } from "../../db/schema/businessMemberships.js";
import { roles } from "../../db/schema/roles.js";
import { subscriptions } from "../../db/schema/subscriptions.js";
import type { RegisterInput, LoginInput } from "./auth.validation.js";

const jwtSecret = new TextEncoder().encode(env.jwtSecret);

/** Public shape of a user — never includes passwordHash or token data. */
export interface SafeUser {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  platformRole: "none" | "platform_admin";
  emailVerified: boolean;
}

function toSafeUser(row: {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  platformRole: "none" | "platform_admin";
  emailVerifiedAt: Date | null;
}): SafeUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.fullName,
    phone: row.phone,
    platformRole: row.platformRole,
    emailVerified: row.emailVerifiedAt !== null,
  };
}

/** Shape returned by the users insert/select used across this service. */
type UserRow = {
  id: number;
  email: string;
  fullName: string;
  phone: string | null;
  platformRole: "none" | "platform_admin";
  emailVerifiedAt: Date | null;
};

export interface SessionTokens {
  accessToken: string;
  /** Raw refresh token — only ever returned once, for the HttpOnly cookie. */
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

async function issueAccessToken(userId: number): Promise<string> {
  return new SignJWT({ typ: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime(`${env.accessTokenTtlMinutes}m`)
    .sign(jwtSecret);
}

async function issueRefreshToken(
  userId: number,
  meta: { ip?: string | undefined; userAgent?: string | undefined },
): Promise<{ refreshToken: string; expiresAt: Date }> {
  const refreshToken = generateOpaqueToken();
  const expiresAt = addDays(new Date(), env.refreshTokenTtlDays);
  await db.insert(refreshTokens).values({
    userId,
    tokenHash: hashToken(refreshToken),
    expiresAt,
    // Columns are varchar(45)/varchar(255) — truncate defensively.
    ipAddress: meta.ip?.slice(0, 45),
    userAgent: meta.userAgent?.slice(0, 255),
  });
  return { refreshToken, expiresAt };
}

async function revokeAllRefreshTokensForUser(userId: number): Promise<void> {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)),
    );
}

export interface BusinessContextSummary {
  businessId: number;
  businessName: string;
  businessSlug: string;
  roleSlug: string;
  roleName: string;
  subscription: SubscriptionState;
}

export interface MeResult {
  user: SafeUser;
  businesses: BusinessContextSummary[];
}

/**
 * Creates the user account and (for when email delivery is configured) an
 * email-verification token, in one transaction. Delivery infrastructure is
 * not available in this phase — the token is stored but never sent or
 * returned, so verification is dormant until SMTP exists.
 */
export async function registerUser(input: RegisterInput): Promise<SafeUser> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, input.email));
    if (existing) {
      throw new ConflictError("An account with this email already exists.");
    }

    const passwordHash = await hashPassword(input.password);
    let user: UserRow | undefined;
    try {
      [user] = await tx
        .insert(users)
        .values({
          email: input.email,
          passwordHash,
          fullName: input.fullName,
          phone: input.phone ?? null,
          // platformRole stays at its default ("none") — never set from input.
        })
        .returning({
          id: users.id,
          email: users.email,
          fullName: users.fullName,
          phone: users.phone,
          platformRole: users.platformRole,
          emailVerifiedAt: users.emailVerifiedAt,
        });
    } catch (err) {
      // Concurrent registration with the same email loses the unique-index
      // race (23505) — surface it as the same 409 as the pre-check.
      if (
        typeof err === "object" &&
        err !== null &&
        (err as { code?: string }).code === "23505"
      ) {
        throw new ConflictError("An account with this email already exists.");
      }
      throw err;
    }
    if (!user) {
      throw new Error("User insert returned no row.");
    }

    const verificationToken = generateOpaqueToken();
    await tx.insert(emailVerificationTokens).values({
      userId: user.id,
      tokenHash: hashToken(verificationToken),
      expiresAt: new Date(
        Date.now() + env.emailVerificationTokenTtlHours * 60 * 60 * 1000,
      ),
    });

    return toSafeUser(user);
  });
}

/**
 * A pre-computed Argon2id hash of an unknown random password, compared
 * against when the email does not exist so successful and failed logins take
 * similar time (timing-attack mitigation).
 */
const DUMMY_PASSWORD_HASH = await hashPassword(generateOpaqueToken());

const INVALID_CREDENTIALS = new UnauthorizedError(
  "Invalid email or password.",
);

export async function loginUser(
  input: LoginInput,
  meta: { ip?: string | undefined; userAgent?: string | undefined },
): Promise<{ user: SafeUser; tokens: SessionTokens }> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      phone: users.phone,
      platformRole: users.platformRole,
      emailVerifiedAt: users.emailVerifiedAt,
      passwordHash: users.passwordHash,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.email, input.email));

  const passwordOk = await verifyPassword(
    user?.passwordHash ?? DUMMY_PASSWORD_HASH,
    input.password,
  );
  if (!user || !user.isActive || !passwordOk) {
    throw INVALID_CREDENTIALS;
  }

  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));

  const accessToken = await issueAccessToken(user.id);
  const refresh = await issueRefreshToken(user.id, meta);

  return {
    user: toSafeUser(user),
    tokens: {
      accessToken,
      refreshToken: refresh.refreshToken,
      refreshTokenExpiresAt: refresh.expiresAt,
    },
  };
}

/**
 * Grace window for refresh-token rotation. A client retrying a refresh (or a
 * second tab) can present a token that was legitimately rotated moments ago;
 * treating that as an attack would mass-revoke the user's fresh sessions.
 * Reuse within this window is rejected without collateral revocation; reuse
 * after it is treated as a compromised session.
 */
export const REFRESH_REUSE_GRACE_MS = 30_000;

/**
 * Pure decision for a presented token whose stored record is already revoked:
 * should reuse trigger revoking ALL of the user's sessions?
 * - "immediate" — revoked long ago (or never legitimately rotated): attack.
 * - "grace" — revoked within the grace window: likely a concurrent retry.
 */
export function classifyRevokedTokenReuse(
  revokedAt: Date,
  now: Date = new Date(),
): "immediate" | "grace" {
  return now.getTime() - revokedAt.getTime() <= REFRESH_REUSE_GRACE_MS
    ? "grace"
    : "immediate";
}

/**
 * Rotates the presented refresh token.
 *
 * The revocation is an atomic conditional update (`WHERE revoked_at IS NULL
 * ... RETURNING`), so two concurrent rotations of the same token cannot both
 * succeed: exactly one wins, the loser sees the token as revoked.
 *
 * Reuse of a revoked token after the grace window is treated as a
 * compromised session: every refresh token for that user is revoked. Reuse
 * within the window is rejected without collateral revocation.
 */
export async function rotateRefreshToken(
  presentedToken: string,
  meta: { ip?: string | undefined; userAgent?: string | undefined },
): Promise<{ user: SafeUser; tokens: SessionTokens }> {
  const presentedHash = hashToken(presentedToken);
  const [stored] = await db
    .select({
      id: refreshTokens.id,
      userId: refreshTokens.userId,
      expiresAt: refreshTokens.expiresAt,
      revokedAt: refreshTokens.revokedAt,
    })
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, presentedHash));

  if (!stored) {
    throw new UnauthorizedError("Your session is invalid or has expired.");
  }

  if (stored.revokedAt !== null) {
    if (classifyRevokedTokenReuse(stored.revokedAt) === "immediate") {
      await revokeAllRefreshTokensForUser(stored.userId);
      console.warn(
        `Refresh-token reuse (post-grace) detected for user ${stored.userId}; all sessions revoked.`,
      );
    }
    throw new UnauthorizedError("Your session is invalid or has expired.");
  }

  if (stored.expiresAt.getTime() <= Date.now()) {
    throw new UnauthorizedError("Your session is invalid or has expired.");
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      phone: users.phone,
      platformRole: users.platformRole,
      emailVerifiedAt: users.emailVerifiedAt,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.id, stored.userId));

  if (!user || !user.isActive) {
    throw new UnauthorizedError("Your session is invalid or has expired.");
  }

  // Atomic claim: exactly one concurrent rotation wins. A loser observes
  // zero updated rows and falls into the (grace) reuse path.
  const claimed = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(refreshTokens.id, stored.id), isNull(refreshTokens.revokedAt)),
    )
    .returning({ id: refreshTokens.id });
  if (claimed.length === 0) {
    throw new UnauthorizedError("Your session is invalid or has expired.");
  }

  const accessToken = await issueAccessToken(user.id);
  const refresh = await issueRefreshToken(user.id, meta);

  return {
    user: toSafeUser(user),
    tokens: {
      accessToken,
      refreshToken: refresh.refreshToken,
      refreshTokenExpiresAt: refresh.expiresAt,
    },
  };
}

/** Revokes the presented refresh token if it is still active. Idempotent. */
export async function revokeRefreshToken(presentedToken: string): Promise<void> {
  const presentedHash = hashToken(presentedToken);
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(eq(refreshTokens.tokenHash, presentedHash), isNull(refreshTokens.revokedAt)),
    );
}

export async function getCurrentUserContext(
  userId: number,
): Promise<MeResult> {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      phone: users.phone,
      platformRole: users.platformRole,
      emailVerifiedAt: users.emailVerifiedAt,
    })
    .from(users)
    .where(eq(users.id, userId));
  if (!user) {
    throw new UnauthorizedError("Your session is invalid or has expired.");
  }

  const memberships = await db
    .select({
      businessId: businesses.id,
      businessName: businesses.name,
      businessSlug: businesses.slug,
      roleSlug: roles.slug,
      roleName: roles.name,
    })
    .from(businessMemberships)
    .innerJoin(businesses, eq(businesses.id, businessMemberships.businessId))
    .innerJoin(roles, eq(roles.id, businessMemberships.roleId))
    .where(
      and(
        eq(businessMemberships.userId, userId),
        eq(businessMemberships.status, "active"),
      ),
    );

  const openSubscriptions =
    memberships.length === 0
      ? []
      : await db
          .select({
            businessId: subscriptions.businessId,
            status: subscriptions.status,
            currentPeriodEnd: subscriptions.currentPeriodEnd,
          })
          .from(subscriptions)
          .where(
            and(
              inArray(subscriptions.status, ["trialing", "active", "past_due"]),
              inArray(
                subscriptions.businessId,
                memberships.map((m) => m.businessId),
              ),
              gt(
                subscriptions.currentPeriodEnd,
                new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
              ),
            ),
          );

  const subscriptionByBusiness = new Map(
    openSubscriptions.map((sub) => [sub.businessId, sub]),
  );

  return {
    user: toSafeUser(user),
    businesses: memberships.map((membership) => {
      const sub = subscriptionByBusiness.get(membership.businessId);
      return {
        ...membership,
        subscription: computeSubscriptionState(sub ?? null),
      };
    }),
  };
}

/**
 * Marks an email-verification token used and stamps the user's
 * emailVerifiedAt, in one transaction. Returns false for unknown, used, or
 * expired tokens.
 */
export async function verifyEmailToken(token: string): Promise<boolean> {
  return db.transaction(async (tx) => {
    const tokenHash = hashToken(token);
    const [record] = await tx
      .select({
        id: emailVerificationTokens.id,
        userId: emailVerificationTokens.userId,
        expiresAt: emailVerificationTokens.expiresAt,
        usedAt: emailVerificationTokens.usedAt,
      })
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.tokenHash, tokenHash));

    if (!record || record.usedAt !== null) return false;
    if (record.expiresAt.getTime() <= Date.now()) return false;

    await tx
      .update(emailVerificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(emailVerificationTokens.id, record.id));
    await tx
      .update(users)
      .set({ emailVerifiedAt: new Date() })
      .where(eq(users.id, record.userId));
    return true;
  });
}

/** Most recent verification token issue time, or null if none exists. */
export async function latestVerificationTokenIssuedAt(
  userId: number,
): Promise<Date | null> {
  const [record] = await db
    .select({ createdAt: emailVerificationTokens.createdAt })
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.userId, userId))
    .orderBy(desc(emailVerificationTokens.createdAt))
    .limit(1);
  return record?.createdAt ?? null;
}
