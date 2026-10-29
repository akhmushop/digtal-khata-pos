import type { Response } from "express";
import { error } from "node:console";
//1. for missing items (HTTP 404)
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}
//2. for missing data or bad logic (HTTP 400)
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}
//3. For permissions (HTTP 403)
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}
//4. for database conflicts, like duplicate emails or barcode (HTTP 409)
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictsError";
  }
}
//5. for missing or invalid authentication (HTTP 401)
export class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}
/**
 * Legacy helper — no module calls it anymore (new code uses `sendSafeError`).
 * Kept only so the error classes above stay co-located; its fallback returns
 * a generic message instead of raw `err.message` so it can never leak
 * internals if it is ever called again.
 */
export function handleError(res: Response, err: unknown) {
  console.error(err);
  if (err instanceof BadRequestError) {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err instanceof ConflictError) {
    return res.status(409).json({ success: false, message: err.message });
  }
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  res
    .status(500)
    .json({ success: false, message: "An unexpected server error occurred." });
}
