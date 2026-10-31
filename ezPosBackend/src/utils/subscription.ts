/**
 * Pure helpers (no I/O) so they can be unit-tested without a database.
 */

export function slugifyBusinessName(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
  return base === "" ? "business" : base;
}

export type SubscriptionAccessMode = "full" | "read_only";

export type SubscriptionStatusValue =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "suspended"
  | "canceled"
  | "expired";

/**
 * How long a `past_due` subscription keeps full access while the customer
 * completes payment (the dunning grace period). After it lapses the account
 * drops to read-only until the subscription is renewed.
 */
export const PAST_DUE_GRACE_DAYS = 7;

export interface SubscriptionState {
  status: SubscriptionStatusValue;
  accessMode: SubscriptionAccessMode;
  trial: boolean;
  currentPeriodEnd: Date | null;
  /** Set when status is past_due: when the grace period ends. */
  graceEndsAt: Date | null;
}

/**
 * Maps a business's open subscription (if any) to an access mode using the
 * stored period end — never client-supplied values or the browser clock.
 *
 - `trialing` within its period or an `active` subscription → full access.
 - `past_due` → full access for PAST_DUE_GRACE_DAYS after the period end,
   then read-only.
 - Anything else (expired trial, suspended, canceled, or no subscription)
   → read-only until a valid paid/active subscription is verified.
 */
export function computeSubscriptionState(
  subscription: {
    status: "trialing" | "active" | "past_due" | "suspended" | "canceled" | "expired";
    currentPeriodEnd: Date;
  } | null,
  now: Date = new Date(),
): SubscriptionState {
  if (!subscription) {
    return {
      status: "none",
      accessMode: "read_only",
      trial: false,
      currentPeriodEnd: null,
      graceEndsAt: null,
    };
  }

  const periodValid = now.getTime() <= subscription.currentPeriodEnd.getTime();

  if (subscription.status === "trialing") {
    return periodValid
      ? {
          status: "trialing",
          accessMode: "full",
          trial: true,
          currentPeriodEnd: subscription.currentPeriodEnd,
          graceEndsAt: null,
        }
      : {
          status: "expired",
          accessMode: "read_only",
          trial: true,
          currentPeriodEnd: subscription.currentPeriodEnd,
          graceEndsAt: null,
        };
  }

  if (subscription.status === "active" && periodValid) {
    return {
      status: "active",
      accessMode: "full",
      trial: false,
      currentPeriodEnd: subscription.currentPeriodEnd,
      graceEndsAt: null,
    };
  }

  if (subscription.status === "past_due") {
    const graceEndsAt = addDays(
      subscription.currentPeriodEnd,
      PAST_DUE_GRACE_DAYS,
    );
    const graceValid = now.getTime() <= graceEndsAt.getTime();
    return {
      status: "past_due",
      accessMode: graceValid ? "full" : "read_only",
      trial: false,
      currentPeriodEnd: subscription.currentPeriodEnd,
      graceEndsAt,
    };
  }

  return {
    status: subscription.status,
    accessMode: "read_only",
    trial: false,
    currentPeriodEnd: subscription.currentPeriodEnd,
    graceEndsAt: null,
  };
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Proration for an immediate plan upgrade: the price difference applied to
 * the REMAINING fraction of the current period. Never negative — a downgrade
 * of unused time is not credited (it is scheduled for period end instead).
 * Works in integer cents to avoid float drift; result is a decimal amount.
 */
export function computeUpgradeCharge(
  currentPrice: number,
  newPrice: number,
  periodStart: Date,
  periodEnd: Date,
  now: Date,
): number {
  const totalMs = Math.max(0, periodEnd.getTime() - periodStart.getTime());
  const remainingMs = Math.max(0, periodEnd.getTime() - now.getTime());
  if (totalMs === 0 || remainingMs === 0) return 0;
  const currentCents = Math.round(currentPrice * 100);
  const newCents = Math.round(newPrice * 100);
  const diffCents = Math.max(0, newCents - currentCents);
  const chargeCents = Math.round((diffCents * remainingMs) / totalMs);
  return chargeCents / 100;
}
