import type { Response } from "express";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "./handleError.js";

/**
 * Maps known error classes to safe HTTP responses and never leaks internal
 * details (SQL messages, stack traces) for unexpected errors — those are
 * logged server-side and replaced with a generic message.
 *
 * New modules should use this instead of the legacy `handleError`, whose
 * fallback returns raw `err.message` to clients.
 */
export function sendSafeError(
  res: Response,
  err: unknown,
  fallbackMessage: string,
): Response {
  if (err instanceof BadRequestError) {
    return res
      .status(400)
      .json({ success: false, message: err.message });
  }
  if (err instanceof NotFoundError) {
    return res
      .status(404)
      .json({ success: false, message: err.message });
  }
  if (err instanceof UnauthorizedError) {
    return res
      .status(401)
      .json({ success: false, message: err.message });
  }
  if (err instanceof ForbiddenError) {
    return res.status(403).json({
      success: false,
      message: err.message,
      ...(err.code ? { code: err.code } : {}),
    });
  }
  if (err instanceof ConflictError) {
    return res
      .status(409)
      .json({ success: false, message: err.message });
  }
  console.error(err);
  return res
    .status(500)
    .json({ success: false, message: fallbackMessage });
}
