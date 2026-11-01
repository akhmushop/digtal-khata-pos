import { and, eq, sql } from "drizzle-orm";
import { db } from "../db/schema/index.js";
import { subscriptions } from "../db/schema/subscriptions.js";
import { subscriptionPlans } from "../db/schema/subscriptionPlans.js";
import { recordEvent } from "../modules/subscriptions/subscription.service.js";
import {
  notifyRenewalReminder,
  notifySubscriptionExpired,
  notifyTrialEnding,
} from "../services/email/email.hooks.js";
import { PAST_DUE_GRACE_DAYS } from "../utils/subscription.js";

/**
 * Subscription lifecycle sweeps. Run by the scheduler on an interval and
 * manually via POST /api/saas/jobs/run (platform admin).
 *
 * Safety properties:
 * - Retry-safe: every sweep selects its due rows with FOR UPDATE SKIP
 *   LOCKED inside one transaction, so overlapping runs and concurrent
 *   instances never process the same transition twice.
 * - Reminder-deduped: reminder emails are guarded by a subscription_events
 *   row, so a sweep that runs twice never sends twice.
 * - Each sweep is independent: one failure does not block the others.
 */

export interface SweepResults {
  expiredTrials: number;
  trialReminders: number;
  renewalReminders: number;
  graceSuspensions: number;
}

/** Days before period end that reminder emails go out. */
export const REMINDER_DAYS_BEFORE = 3;

/** Expire trials whose period has lapsed. */
async function sweepExpiredTrials(now: Date): Promise<number> {
  return db.transaction(async (tx) => {
    const due = await tx
      .select({
        id: subscriptions.id,
        businessId: subscriptions.businessId,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, "trialing"),
          sql`${subscriptions.currentPeriodEnd} < ${now.toISOString()}`,
        ),
      )
      .for("update", { skipLocked: true });

    for (const subscription of due) {
      await tx
        .update(subscriptions)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(subscriptions.id, subscription.id));
      await recordEvent(tx, {
        subscriptionId: subscription.id,
        eventType: "trial_expired",
        fromStatus: "trialing",
        toStatus: "expired",
        actor: { type: "system" },
      });
      notifySubscriptionExpired(subscription.businessId);
    }
    return due.length;
  });
}

/** Send trial-ending reminders (once per subscription). */
async function sweepTrialReminders(now: Date): Promise<number> {
  return db.transaction(async (tx) => {
    const due = await tx
      .select({
        id: subscriptions.id,
        businessId: subscriptions.businessId,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, "trialing"),
          sql`${subscriptions.currentPeriodEnd} >= ${now.toISOString()}`,
          sql`${subscriptions.currentPeriodEnd} <= now() + INTERVAL '${sql.raw(
            String(REMINDER_DAYS_BEFORE),
          )} days'`,
          sql`NOT EXISTS (
            SELECT 1 FROM subscription_events e
            WHERE e.subscription_id = ${subscriptions.id}
              AND e.event_type = 'trial_ending_reminder'
          )`,
        ),
      )
      .for("update", { skipLocked: true });

    for (const subscription of due) {
      await recordEvent(tx, {
        subscriptionId: subscription.id,
        eventType: "trial_ending_reminder",
        fromStatus: "trialing",
        toStatus: "trialing",
        actor: { type: "system" },
        metadata: { periodEnd: subscription.currentPeriodEnd.toISOString() },
      });
      notifyTrialEnding(subscription.businessId, subscription.currentPeriodEnd);
    }
    return due.length;
  });
}

/** Send upcoming-renewal reminders for paid subscriptions (once each). */
async function sweepRenewalReminders(now: Date): Promise<number> {
  return db.transaction(async (tx) => {
    const due = await tx
      .select({
        id: subscriptions.id,
        businessId: subscriptions.businessId,
        planName: subscriptionPlans.name,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
      })
      .from(subscriptions)
      .innerJoin(
        subscriptionPlans,
        eq(subscriptionPlans.id, subscriptions.planId),
      )
      .where(
        and(
          eq(subscriptions.status, "active"),
          sql`${subscriptionPlans.price} > 0`,
          sql`${subscriptions.currentPeriodEnd} >= ${now.toISOString()}`,
          sql`${subscriptions.currentPeriodEnd} <= now() + INTERVAL '${sql.raw(
            String(REMINDER_DAYS_BEFORE),
          )} days'`,
          sql`NOT EXISTS (
            SELECT 1 FROM subscription_events e
            WHERE e.subscription_id = ${subscriptions.id}
              AND e.event_type = 'renewal_reminder'
          )`,
        ),
      )
      .for("update", { skipLocked: true });

    for (const subscription of due) {
      await recordEvent(tx, {
        subscriptionId: subscription.id,
        eventType: "renewal_reminder",
        fromStatus: "active",
        toStatus: "active",
        actor: { type: "system" },
        metadata: { periodEnd: subscription.currentPeriodEnd.toISOString() },
      });
      notifyRenewalReminder(
        subscription.businessId,
        subscription.planName,
        subscription.currentPeriodEnd,
      );
    }
    return due.length;
  });
}

/** Suspend past-due subscriptions whose grace period has fully lapsed. */
async function sweepGraceExpiry(now: Date): Promise<number> {
  return db.transaction(async (tx) => {
    const due = await tx
      .select({
        id: subscriptions.id,
        businessId: subscriptions.businessId,
      })
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.status, "past_due"),
          sql`${subscriptions.currentPeriodEnd} + (${sql.raw(
            String(PAST_DUE_GRACE_DAYS),
          )} * INTERVAL '1 day') < ${now.toISOString()}`,
        ),
      )
      .for("update", { skipLocked: true });

    for (const subscription of due) {
      await tx
        .update(subscriptions)
        .set({ status: "suspended", suspendedAt: new Date(), updatedAt: new Date() })
        .where(eq(subscriptions.id, subscription.id));
      await recordEvent(tx, {
        subscriptionId: subscription.id,
        eventType: "grace_expired",
        fromStatus: "past_due",
        toStatus: "suspended",
        actor: { type: "system" },
        metadata: { graceDays: PAST_DUE_GRACE_DAYS },
      });
    }
    return due.length;
  });
}

/** Runs all sweeps; each is independent so one failure never blocks others. */
export async function runSubscriptionSweeps(
  now: Date = new Date(),
): Promise<SweepResults> {
  const results: SweepResults = {
    expiredTrials: 0,
    trialReminders: 0,
    renewalReminders: 0,
    graceSuspensions: 0,
  };
  const safeRun = async (
    key: keyof SweepResults,
    sweep: () => Promise<number>,
  ) => {
    try {
      results[key] = await sweep();
    } catch (err) {
      console.error(`Sweep ${key} failed:`, err);
    }
  };
  await safeRun("expiredTrials", () => sweepExpiredTrials(now));
  await safeRun("trialReminders", () => sweepTrialReminders(now));
  await safeRun("renewalReminders", () => sweepRenewalReminders(now));
  await safeRun("graceSuspensions", () => sweepGraceExpiry(now));
  return results;
}
