import {
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { subscriptions } from "./subscriptions.js";

export const subscriptionPayments = pgTable("subscription_payments", {
  id: serial().primaryKey().notNull(),
  subscriptionId: integer("subscription_id")
    .notNull()
    .references(() => subscriptions.id, { onDelete: "cascade" }),
  amount: numeric({ precision: 10, scale: 2, mode: "number" }).notNull(),
  currency: varchar({ length: 3 }).default("BDT").notNull(),
  status: varchar({ length: 30 }).notNull(),
  provider: varchar({ length: 50 }),
  providerReference: varchar("provider_reference", { length: 100 }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  periodStart: timestamp("period_start", { withTimezone: true }),
  periodEnd: timestamp("period_end", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
