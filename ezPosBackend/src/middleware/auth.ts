import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { jwtVerify } from "jose";
import { db } from "../db/schema/index.js";
import { users } from "../db/schema/users.js";
import { env } from "../config/env.js";

const jwtSecret = new TextEncoder().encode(env.jwtSecret);

const AUTH_REQUIRED = {
  success: false,
  message: "Authentication required.",
} as const;

const AUTH_INVALID = {
  success: false,
  message: "Your session is invalid or has expired.",
} as const;

/**
 * Verifies the Bearer access token (signature, expiry, type) and loads the
 * current user from the database so deactivated accounts lose access
 * immediately instead of at token expiry.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json(AUTH_REQUIRED);
  }
  const token = header.slice("Bearer ".length).trim();
  if (token === "") {
    return res.status(401).json(AUTH_REQUIRED);
  }

  try {
    const { payload } = await jwtVerify(token, jwtSecret, {
      algorithms: ["HS256"],
    });
    if (payload.typ !== "access" || typeof payload.sub !== "string") {
      return res.status(401).json(AUTH_INVALID);
    }
    const userId = Number(payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(401).json(AUTH_INVALID);
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        fullName: users.fullName,
        platformRole: users.platformRole,
        isActive: users.isActive,
        emailVerified: users.emailVerifiedAt,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !user.isActive) {
      return res.status(401).json(AUTH_INVALID);
    }

    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      platformRole: user.platformRole,
      emailVerified: user.emailVerified !== null,
    };
    next();
  } catch {
    // Signature, expiry, or malformed token — never leak which one.
    return res.status(401).json(AUTH_INVALID);
  }
}
