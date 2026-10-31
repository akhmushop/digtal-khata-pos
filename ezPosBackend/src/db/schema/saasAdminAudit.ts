import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

/**
 * Audit trail for SaaS-owner administrative actions (plan changes from the
 * admin panel, business suspension, subscription overrides, ...).
 * Subscription lifecycle changes additionally land in subscription_events;
 * this table captures the "who did what" for everything else.
 */
export const saasAdminAudit = pgTable(
  "saas_admin_audit",
  {
    id: serial().primaryKey().notNull(),
    adminUserId: integer("admin_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    action: varchar({ length: 60 }).notNull(),
    entityType: varchar("entity_type", { length: 30 }).notNull(),
    entityId: integer("entity_id"),
    metadata: jsonb().$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("saas_admin_audit_admin_idx").on(table.adminUserId),
    index("saas_admin_audit_entity_idx").on(table.entityType, table.entityId),
  ],
);
