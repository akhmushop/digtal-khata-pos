import type { NextFunction, Request, Response } from "express";

/**
 * Gates SaaS-owner endpoints: the authenticated user must be a platform
 * admin (users.platform_role = 'platform_admin'). This is an
 * account-level role, deliberately separate from business-scoped RBAC —
 * ordinary business owners can never reach SaaS administration.
 * requireAuth must run before this in the route chain.
 */
export function requirePlatformAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required." });
  }
  if (req.user.platformRole !== "platform_admin") {
    return res.status(403).json({
      success: false,
      message: "Platform administrator access is required.",
    });
  }
  next();
}
