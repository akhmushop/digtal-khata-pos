import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Opaque refresh/verification tokens: a high-entropy random string is given
 * to the client while only its SHA-256 hash is stored (the token schema's
 * `token_hash` columns hold hashes, never raw tokens).
 */
export function generateOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/** Constant-time comparison of a presented token against a stored hash. */
export function tokensMatch(presented: string, storedHash: string): boolean {
  const presentedHash = Buffer.from(hashToken(presented), "hex");
  const stored = Buffer.from(storedHash, "hex");
  return (
    presentedHash.length === stored.length && timingSafeEqual(presentedHash, stored)
  );
}
