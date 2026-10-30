import {
  hash as argonHash,
  verify as argonVerify,
} from "@node-rs/argon2";

// OWASP-recommended Argon2id parameters: m=19456 KiB, t=2, p=1.
// (The library's default algorithm is Argon2id; the Algorithm enum cannot be
// referenced at runtime under verbatimModuleSyntax.)
const ARGON2_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(plain: string): Promise<string> {
  return argonHash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(
  storedHash: string,
  plain: string,
): Promise<boolean> {
  try {
    return await argonVerify(storedHash, plain, ARGON2_OPTIONS);
  } catch {
    // A malformed stored hash must read as a failed login, never a crash.
    return false;
  }
}
