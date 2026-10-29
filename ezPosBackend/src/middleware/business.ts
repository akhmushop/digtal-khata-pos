import type { NextFunction, Request, Response } from "express";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db/schema/index.js";
import { businessMemberships } from "../db/schema/businessMemberships.js";
import { businesses } from "../db/schema/businesses.js";
import { roles } from "../db/schema/roles.js";
import { subscriptions } from "../db/schema/subscriptions.js";
import { computeSubscriptionState } from "../utils/subscription.js";

const OPEN_SUBSCRIPTION_STATUSES = ["trialing", "active", "past_due"] as const;

const TENANT_HEADER = "x-business-id";

function unauthorized(res: Response) {
  return res
    .status(401)
    .json({ success: false, message: "Authentication required." });
}

/**
 * Loads the caller's ACTIVE OWNER membership in `businessId` and the
 * business's subscription state, attaching both to the request.
 *
 * The client-supplied business selector is a HINT, never proof of access:
 * every value attached here is derived from the database. For the owner-only
 * launch the membership row must carry the per-business "owner" role; when
 * staff roles are introduced this predicate is replaced by a permission check.
 *
 * Returns null (response already sent) when the caller has no qualifying
 * membership — indistinguishable from the business not existing, so another
 * business's record existence is never revealed.
 */
async function resolveBusinessContext(
  req: Request,
  res: Response,
  businessId: number,
  requiredRoleSlug: string | null,
): Promise<boolean> {
  const [membership] = await db
    .select({
      membershipId: businessMemberships.id,
      roleSlug: roles.slug,
      roleName: roles.name,
    })
    .from(businessMemberships)
    .innerJoin(roles, eq(roles.id, businessMemberships.roleId))
    .where(
      and(
        eq(businessMemberships.userId, req.user!.id),
        eq(businessMemberships.businessId, businessId),
        eq(businessMemberships.status, "active"),
        ...(requiredRoleSlug ? [eq(roles.slug, requiredRoleSlug)] : []),
      ),
    );

  if (!membership) {
    res.status(403).json({
      success: false,
      message: "You do not have access to this business.",
    });
    return false;
  }

  const [subscription] = await db
    .select({
      status: subscriptions.status,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
    })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.businessId, businessId),
        inArray(subscriptions.status, [...OPEN_SUBSCRIPTION_STATUSES]),
      ),
    );

  req.membership = {
    membershipId: membership.membershipId,
    businessId,
    roleSlug: membership.roleSlug,
    roleName: membership.roleName,
  };
  req.subscriptionAccess = computeSubscriptionState(subscription ?? null);
  return true;
}

function parseBusinessId(raw: string): number | null {
  const businessId = Number(raw);
  return Number.isInteger(businessId) && businessId > 0 ? businessId : null;
}

/**
 * Returns the server-verified businessId for a request that has passed
 * requireBusinessContext/requireBusinessAccess. Throws (→ generic 500) if
 * called on a route that skipped the middleware — a programming error, not
 * a client error.
 */
export function getBusinessId(req: Request): number {
  if (!req.user || !req.membership) {
    throw new Error(
      "getBusinessId() used on a route without requireBusinessContext/requireBusinessAccess",
    );
  }
  return req.membership.businessId;
}

/**
 * Tenant context from the `X-Business-Id` header (the POS route transport).
 * The header is a selector, never proof of access: membership is always
 * verified. Owner-only for the launch.
 */
export function requireBusinessContext() {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return unauthorized(res);

    const rawHeader = req.headers[TENANT_HEADER];
    const raw = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
    if (typeof raw !== "string" || raw.trim() === "") {
      return res.status(400).json({
        success: false,
        message: `The ${TENANT_HEADER} header is required.`,
      });
    }
    const businessId = parseBusinessId(raw.trim());
    if (businessId === null) {
      return res.status(400).json({
        success: false,
        message: "A valid business ID is required.",
      });
    }

    try {
      const ok = await resolveBusinessContext(req, res, businessId, "owner");
      if (ok) next();
    } catch (err) {
      console.error("Business context check failed:", err);
      return res.status(500).json({
        success: false,
        message: "Unable to verify business access right now.",
      });
    }
  };
}

/**
 * Tenant context from a route path parameter (used by the /api/businesses
 * routes themselves). Any active member qualifies — the owner-only rule
 * applies to the POS route chain, not to these account-level routes.
 */
export function requireBusinessAccess(paramName = "businessId") {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return unauthorized(res);

    const rawParam = req.params[paramName];
    const businessId = parseBusinessId(
      typeof rawParam === "string" ? rawParam : "",
    );
    if (businessId === null) {
      return res.status(400).json({
        success: false,
        message: "A valid business ID is required.",
      });
    }

    try {
      const ok = await resolveBusinessContext(req, res, businessId, null);
      if (ok) next();
    } catch (err) {
      console.error("Business access check failed:", err);
      return res.status(500).json({
        success: false,
        message: "Unable to verify business access right now.",
      });
    }
  };
}

/**
 * Blocks state-changing business operations unless the verified subscription
 * state grants full access (active trial period or active paid plan).
 * Read-only endpoints stay reachable for expired trials.
 */
export function requireFullAccess(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const access = req.subscriptionAccess;
  if (!access) {
    return res.status(500).json({
      success: false,
      message: "Subscription state was not evaluated for this request.",
    });
  }
  if (access.accessMode === "full") {
    next();
    return;
  }
  return res.status(403).json({
    success: false,
    code: access.trial && access.status === "expired"
      ? "TRIAL_EXPIRED"
      : "SUBSCRIPTION_REQUIRED",
    message:
      access.trial && access.status === "expired"
        ? "Your free trial has ended. Choose a plan to continue making changes."
        : "An active subscription is required for this action.",
  });
}
