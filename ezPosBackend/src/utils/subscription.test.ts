import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addDays,
  computeSubscriptionState,
  slugifyBusinessName,
} from "./subscription.js";

describe("slugifyBusinessName", () => {
  it("lowercases and separators ordinary names", () => {
    assert.equal(slugifyBusinessName("Arif General Store"), "arif-general-store");
  });

  it("strips characters that are not letters or digits", () => {
    assert.equal(slugifyBusinessName("Rahim & Sons!"), "rahim-sons");
  });

  it("falls back to 'business' when nothing usable remains", () => {
    assert.equal(slugifyBusinessName("---"), "business");
    assert.equal(slugifyBusinessName("   "), "business");
  });

  it("caps the base slug length to leave room for suffixes", () => {
    const long = "S".repeat(200);
    assert.ok(slugifyBusinessName(long).length <= 90);
  });
});

describe("computeSubscriptionState", () => {
  const now = new Date("2026-10-29T12:00:00.000Z");

  it("no subscription means read-only access", () => {
    const state = computeSubscriptionState(null, now);
    assert.equal(state.status, "none");
    assert.equal(state.accessMode, "read_only");
    assert.equal(state.trial, false);
    assert.equal(state.currentPeriodEnd, null);
  });

  it("trial within its period gets full access", () => {
    const state = computeSubscriptionState(
      {
        status: "trialing",
        currentPeriodEnd: addDays(now, 3),
      },
      now,
    );
    assert.equal(state.status, "trialing");
    assert.equal(state.accessMode, "full");
    assert.equal(state.trial, true);
  });

  it("trial past its period is expired and read-only", () => {
    const state = computeSubscriptionState(
      {
        status: "trialing",
        currentPeriodEnd: addDays(now, -1),
      },
      now,
    );
    assert.equal(state.status, "expired");
    assert.equal(state.accessMode, "read_only");
    assert.equal(state.trial, true);
  });

  it("trial expiring exactly now is still full (inclusive end)", () => {
    const state = computeSubscriptionState(
      { status: "trialing", currentPeriodEnd: now },
      now,
    );
    assert.equal(state.accessMode, "full");
  });

  it("active subscription within its period gets full access", () => {
    const state = computeSubscriptionState(
      { status: "active", currentPeriodEnd: addDays(now, 10) },
      now,
    );
    assert.equal(state.status, "active");
    assert.equal(state.accessMode, "full");
  });

  it("past_due is read-only until payment is verified", () => {
    const state = computeSubscriptionState(
      { status: "past_due", currentPeriodEnd: addDays(now, 10) },
      now,
    );
    assert.equal(state.accessMode, "read_only");
    assert.equal(state.trial, false);
  });

  it("canceled and expired subscriptions are read-only", () => {
    for (const status of ["canceled", "expired"] as const) {
      const state = computeSubscriptionState(
        { status, currentPeriodEnd: addDays(now, 5) },
        now,
      );
      assert.equal(state.accessMode, "read_only", status);
    }
  });
});

describe("addDays", () => {
  it("adds whole days in UTC-safe millisecond arithmetic", () => {
    const base = new Date("2026-10-29T12:00:00.000Z");
    assert.equal(addDays(base, 14).toISOString(), "2026-11-12T12:00:00.000Z");
  });
});
