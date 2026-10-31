import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { subscriptionStatusEnum } from "./saasEnums.js";
import { businesses } from "./businesses.js";
import { subscriptionPlans } from "./subscriptionPlans.js";

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "restrict" }),
    planId: integer("plan_id")
      .notNull()
      .references(() => subscriptionPlans.id, { onDelete: "restrict" }),
    status: subscriptionStatusEnum("status").default("trialing").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }).notNull(),
    currentPeriodEnd: timestamp("current_period_end", {
      withTimezone: true,
    }).notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    canceledAt: timestamp("canceled_at", { withTimezone: true }),
    /** Scheduled downgrade/cycle change — applied at renewal time. */
    pendingPlanId: integer("pending_plan_id").references(
      () => subscriptionPlans.id,
      { onDelete: "set null" },
    ),
    suspendedAt: timestamp("suspended_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("subscriptions_one_open_per_business")
      .on(table.businessId)
      .where(sql`${table.status} in ('trialing','active','past_due')`),
  ],
);
