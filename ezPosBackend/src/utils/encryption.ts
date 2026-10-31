import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { env } from "../config/env.js";

/**
 * AES-256-GCM encryption for integration credentials (WooCommerce consumer
 * keys etc.). The key is derived from INTEGRATION_ENCRYPTION_KEY; without
 * it, encrypting (i.e. connecting an integration) fails fast — decrypting
 * after a lost key fails loudly with a clear message, never silently.
 */

function derivedKey(): Buffer {
  const secret = env.integrationEncryptionKey;
  if (!secret) {
    throw new Error(
      "INTEGRATION_ENCRYPTION_KEY is required to store integration credentials.",
    );
  }
  return createHash("sha256").update(secret).digest();
}

export interface EncryptedSecret {
  cipherText: string;
  iv: string;
  authTag: string;
  keyVersion: 1;
}

export function encryptSecret(plaintext: string): EncryptedSecret {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", derivedKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  return {
    cipherText: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    keyVersion: 1,
  };
}

export function decryptSecret(encrypted: EncryptedSecret): string {
  const decipher = createDecipheriv(
    "aes-256-gcm",
    derivedKey(),
    Buffer.from(encrypted.iv, "base64"),
  );
  decipher.setAuthTag(Buffer.from(encrypted.authTag, "base64"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.cipherText, "base64")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}
