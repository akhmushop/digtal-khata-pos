import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateOpaqueToken, hashToken, tokensMatch } from "./tokens.js";

describe("generateOpaqueToken", () => {
  it("produces long, URL-safe tokens", () => {
    const token = generateOpaqueToken();
    assert.ok(token.length >= 40);
    assert.match(token, /^[A-Za-z0-9_-]+$/);
  });

  it("produces unique tokens", () => {
    const seen = new Set(Array.from({ length: 1000 }, generateOpaqueToken));
    assert.equal(seen.size, 1000);
  });
});

describe("hashToken", () => {
  it("is deterministic and 64 hex chars (SHA-256)", () => {
    assert.equal(hashToken("abc"), hashToken("abc"));
    assert.match(hashToken("abc"), /^[0-9a-f]{64}$/);
  });

  it("differs for different inputs", () => {
    assert.notEqual(hashToken("abc"), hashToken("abd"));
  });
});

describe("tokensMatch", () => {
  it("matches a token against its stored hash", () => {
    const token = generateOpaqueToken();
    assert.equal(tokensMatch(token, hashToken(token)), true);
  });

  it("rejects wrong tokens and wrong hash lengths", () => {
    const token = generateOpaqueToken();
    assert.equal(tokensMatch(generateOpaqueToken(), hashToken(token)), false);
    assert.equal(tokensMatch(token, "not-a-hash"), false);
  });
});
