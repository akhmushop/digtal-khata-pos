import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  REFRESH_REUSE_GRACE_MS,
  classifyRevokedTokenReuse,
} from "./auth.service.js";

describe("classifyRevokedTokenReuse", () => {
  const now = new Date("2026-10-29T12:00:00.000Z");

  it("treats reuse within the grace window as a concurrent retry (no mass revocation)", () => {
    const revokedAt = new Date(now.getTime() - REFRESH_REUSE_GRACE_MS);
    assert.equal(classifyRevokedTokenReuse(revokedAt, now), "grace");
    assert.equal(
      classifyRevokedTokenReuse(new Date(now.getTime() - 1), now),
      "grace",
    );
  });

  it("treats reuse after the grace window as an attack (mass revocation)", () => {
    const revokedAt = new Date(now.getTime() - REFRESH_REUSE_GRACE_MS - 1);
    assert.equal(classifyRevokedTokenReuse(revokedAt, now), "immediate");
    assert.equal(
      classifyRevokedTokenReuse(new Date(now.getTime() - 60_000), now),
      "immediate",
    );
  });

  it("defaults 'now' to the current time", () => {
    assert.equal(
      classifyRevokedTokenReuse(new Date(Date.now() - 3_600_000)),
      "immediate",
    );
  });
});
