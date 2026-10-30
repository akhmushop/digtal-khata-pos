import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hashPassword, verifyPassword } from "./password.js";

describe("password hashing (Argon2id)", () => {
  it("round-trips a correct password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    assert.equal(await verifyPassword(hash, "correct horse battery staple"), true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("correct horse battery staple");
    assert.equal(await verifyPassword(hash, "wrong password"), false);
  });

  it("never stores the plaintext and salts every hash", async () => {
    const hash = await hashPassword("secret-password");
    assert.ok(hash.startsWith("$argon2id$"));
    assert.ok(!hash.includes("secret-password"));
    const again = await hashPassword("secret-password");
    assert.notEqual(hash, again);
  });

  it("treats a malformed stored hash as a failed verification", async () => {
    assert.equal(await verifyPassword("not-a-hash", "anything"), false);
  });
});
