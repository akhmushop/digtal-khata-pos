import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  PAST_DUE_GRACE_DAYS,
  addDays,
  computeSubscriptionState,
  computeUpgradeCharge,
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

  it("past_due keeps full access during the grace period", () => {
    const state = computeSubscriptionState(
      { status: "past_due", currentPeriodEnd: addDays(now, -1) },
      now,
    );
    assert.equal(state.accessMode, "full");
    assert.equal(state.status, "past_due");
    assert.ok(state.graceEndsAt !== null);
  });

  it("past_due drops to read-only once the grace period lapses", () => {
    const state = computeSubscriptionState(
      {
        status: "past_due",
        currentPeriodEnd: addDays(now, -(PAST_DUE_GRACE_DAYS + 1)),
      },
      now,
    );
    assert.equal(state.accessMode, "read_only");
  });

  it("past_due at the grace deadline boundary is still full (inclusive end)", () => {
    const periodEnd = addDays(now, -PAST_DUE_GRACE_DAYS);
    const state = computeSubscriptionState({ status: "past_due", currentPeriodEnd: periodEnd }, now);
    assert.equal(state.accessMode, "full");
  });

  it("suspended subscriptions are read-only", () => {
    const state = computeSubscriptionState(
      { status: "suspended", currentPeriodEnd: addDays(now, 10) },
      now,
    );
    assert.equal(state.accessMode, "read_only");
    assert.equal(state.status, "suspended");
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

describe("computeUpgradeCharge", () => {
  const periodStart = new Date("2026-10-01T00:00:00.000Z");
  const periodEnd = new Date("2026-11-01T00:00:00.000Z"); // 31 days

  it("charges the price difference prorated over the remaining period", () => {
    // 2026-10-16 → 16 of 31 days remain (Oct 16 → Nov 1), difference 1000.
    const now = new Date("2026-10-16T00:00:00.000Z");
    const charge = computeUpgradeCharge(500, 1500, periodStart, periodEnd, now);
    assert.equal(charge, 516.13); // round(100000 * 16/31)/100
  });

  it("never charges for a downgrade (min 0)", () => {
    const now = new Date("2026-10-16T00:00:00.000Z");
    const charge = computeUpgradeCharge(1500, 500, periodStart, periodEnd, now);
    assert.equal(charge, 0);
  });

  it("charges 0 at the period end (nothing remains)", () => {
    const charge = computeUpgradeCharge(500, 1500, periodStart, periodEnd, periodEnd);
    assert.equal(charge, 0);
  });

  it("charges the full difference on day one", () => {
    const charge = computeUpgradeCharge(500, 1500, periodStart, periodEnd, periodStart);
    assert.equal(charge, 1000);
  });
});

describe("addDays", () => {
  it("adds whole days in UTC-safe millisecond arithmetic", () => {
    const base = new Date("2026-10-29T12:00:00.000Z");
    assert.equal(addDays(base, 14).toISOString(), "2026-11-12T12:00:00.000Z");
  });
});
