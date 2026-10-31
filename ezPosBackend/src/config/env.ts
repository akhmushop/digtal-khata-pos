import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === "") {
    throw new Error(
      `Missing required environment variable ${name}. See .env.example for setup.`,
    );
  }
  return value.trim();
}

function optionalInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === "") return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(
      `Environment variable ${name} must be a positive integer, got "${raw}".`,
    );
  }
  return parsed;
}

/**
 * Server-side policy and configuration. Validated at startup so the server
 * fails fast with a clear message instead of misbehaving later.
 */
export const env = {
  /** HS256 signing secret for access tokens. */
  jwtSecret: (() => {
    const secret = required("AUTH_JWT_SECRET");
    if (secret.length < 32) {
      throw new Error(
        "AUTH_JWT_SECRET is too short — use at least 32 characters (e.g. openssl rand -base64 48).",
      );
    }
    return secret;
  })(),
  isProduction: process.env.NODE_ENV === "production",
  /** Single source of truth for the free-trial duration (days). */
  trialDays: optionalInt("TRIAL_DAYS", 14),
  /** Slug of the plan record trials are attached to (must be seeded). */
  trialPlanSlug: process.env.TRIAL_PLAN_SLUG?.trim() || "free-trial",
  accessTokenTtlMinutes: optionalInt("ACCESS_TOKEN_TTL_MINUTES", 15),
  refreshTokenTtlDays: optionalInt("REFRESH_TOKEN_TTL_DAYS", 7),
  /** Ops-tunable rate-limit ceilings (requests per 15-minute window). */
  authRateLimitMax: optionalInt("AUTH_RATE_LIMIT_MAX", 20),
  refreshRateLimitMax: optionalInt("REFRESH_RATE_LIMIT_MAX", 60),
  emailVerificationTokenTtlHours: optionalInt(
    "EMAIL_VERIFICATION_TOKEN_TTL_HOURS",
    24,
  ),
  /**
   * Browser origins allowed to call this API with credentials (the website
   * and the POS frontend in local development). Comma-separated; no wildcard
   * when credentials are involved.
   */
  corsOrigins: (
    process.env.CORS_ORIGINS?.trim() ||
    "http://localhost:3001,http://localhost:5173"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
} as const;
