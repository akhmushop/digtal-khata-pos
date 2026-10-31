import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { subscriptionActorEnum } from "./saasEnums.js";
import { subscriptions } from "./subscriptions.js";
import { users } from "./users.js";

/**
 * Append-only audit trail of every subscription lifecycle transition
 * (trial started, plan changed, canceled, renewed, suspended, ...).
 * Written by the centralized subscription service only.
 */
export const subscriptionEvents = pgTable(
  "subscription_events",
  {
    id: serial().primaryKey().notNull(),
    subscriptionId: integer("subscription_id")
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    eventType: varchar("event_type", { length: 50 }).notNull(),
    fromStatus: varchar("from_status", { length: 20 }),
    toStatus: varchar("to_status", { length: 20 }),
    actorType: subscriptionActorEnum("actor_type").notNull(),
    actorUserId: integer("actor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    metadata: jsonb().$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("subscription_events_subscription_idx").on(table.subscriptionId),
  ],
);
