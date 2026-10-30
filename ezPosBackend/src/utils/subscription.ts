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
  | "canceled"
  | "expired";

export interface SubscriptionState {
  status: SubscriptionStatusValue;
  accessMode: SubscriptionAccessMode;
  trial: boolean;
  currentPeriodEnd: Date | null;
}

/**
 * Maps a business's open subscription (if any) to an access mode using the
 * stored period end — never client-supplied values or the browser clock.
 *
 - `trialing` within its period or an `active` subscription → full access.
 - Anything else (expired trial, past_due, canceled, or no subscription)
   → read-only until a valid paid/active subscription is verified.
 */
export function computeSubscriptionState(
  subscription: {
    status: "trialing" | "active" | "past_due" | "canceled" | "expired";
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
    };
  }

  const periodValid =
    now.getTime() <= subscription.currentPeriodEnd.getTime();

  if (subscription.status === "trialing") {
    return periodValid
      ? {
          status: "trialing",
          accessMode: "full",
          trial: true,
          currentPeriodEnd: subscription.currentPeriodEnd,
        }
      : {
          status: "expired",
          accessMode: "read_only",
          trial: true,
          currentPeriodEnd: subscription.currentPeriodEnd,
        };
  }

  if (subscription.status === "active" && periodValid) {
    return {
      status: "active",
      accessMode: "full",
      trial: false,
      currentPeriodEnd: subscription.currentPeriodEnd,
    };
  }

  return {
    status: subscription.status,
    accessMode: "read_only",
    trial: false,
    currentPeriodEnd: subscription.currentPeriodEnd,
  };
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}
