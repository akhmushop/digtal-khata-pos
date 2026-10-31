import type { NextFunction, Request, Response } from "express";
import { WILDCARD_PERMISSION } from "../rbac/permissions.js";

const INSUFFICIENT = {
  success: false,
  message: "You do not have permission to perform this action.",
} as const;

/**
 * Permission check against the effective permission set attached by
 * requireBusinessContext/requireBusinessAccess. The owner's wildcard ("*")
 * matches every key. Must run AFTER those middleware — a request without a
 * loaded membership is rejected, never silently allowed.
 */
export function hasPermission(
  permissions: string[] | undefined,
  permission: string,
): boolean {
  if (!permissions) return false;
  return (
    permissions.includes(WILDCARD_PERMISSION) || permissions.includes(permission)
  );
}

/** Controller-level check for permission-dependent logic (e.g. conditional
 *  field stripping) — same rules as the middleware below. */
export function callerHasPermission(req: Request, permission: string): boolean {
  return hasPermission(req.membership?.permissions, permission);
}

/** Requires the caller to hold EVERY listed permission. */
export function requireAllPermissions(required: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required." });
    }
    const granted = req.membership?.permissions;
    const ok = required.every((permission) => hasPermission(granted, permission));
    if (!ok) return res.status(403).json(INSUFFICIENT);
    next();
  };
}

/** Requires the caller to hold AT LEAST ONE of the listed permissions. */
export function requireAnyPermission(required: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required." });
    }
    const granted = req.membership?.permissions;
    const ok = required.some((permission) => hasPermission(granted, permission));
    if (!ok) return res.status(403).json(INSUFFICIENT);
    next();
  };
}

/** Requires a single permission. Usage: requirePermission("pos.view") */
export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required." });
    }
    if (!hasPermission(req.membership?.permissions, permission)) {
      return res.status(403).json(INSUFFICIENT);
    }
    next();
  };
}
