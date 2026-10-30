import { rateLimit } from "express-rate-limit";

const jsonMessage = (message: string) => ({
  success: false,
  message,
});

/**
 * Tighter limit for credential entry points (login, registration, email
 * verification). Keyed by IP; adjust or add a store before horizontal scaling.
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage(
    "Too many attempts. Please try again in a few minutes.",
  ),
});

/**
 * Refresh happens automatically per client whenever the short-lived access
 * token expires, so it gets a higher ceiling than credential endpoints.
 */
export const refreshRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: jsonMessage(
    "Too many session refreshes. Please try again in a few minutes.",
  ),
});
