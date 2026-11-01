import {
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";
import { integrations } from "./integrations.js";

/**
 * API credentials for custom storefronts (Phase 9.2).
 *
 * - Publishable key (`ezpos_pk_…`, stored plain — it is public) may only
 *   read the catalog; optionally domain-restricted.
 * - Secret key (`ezpos_sk_…`) is server-to-server only and stored HASHED —
 *   it is shown exactly once at creation and can never be retrieved.
 * - Scopes gate route access; revoked keys fail immediately (row is
 *   checked on every request).
 */
export const storefrontApiKeys = pgTable(
  "storefront_api_keys",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    integrationId: integer("integration_id").references(
      () => integrations.id,
      { onDelete: "set null" },
    ),
    name: varchar({ length: 120 }).notNull(),
    publishableKey: varchar("publishable_key", { length: 80 })
      .notNull()
      .unique(),
    secretKeyHash: varchar("secret_key_hash", { length: 128 }).notNull(),
    scopes: text("scopes").array().notNull(),
    allowedDomains: text("allowed_domains").array(),
    environment: varchar({ length: 12 }).default("test").notNull(),
    requestCount: integer("request_count").default(0).notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("storefront_api_keys_business_idx").on(table.businessId),
    index("storefront_api_keys_secret_idx").on(table.secretKeyHash),
  ],
);
