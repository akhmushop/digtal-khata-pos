import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";

/**
 * Outbound webhook endpoints (ezPos → customer storefronts). Events are
 * HMAC-SHA256 signed with a per-endpoint secret (AES-encrypted at rest —
 * ezPos needs it to sign) and delivered asynchronously with retries.
 */
export const webhookEndpoints = pgTable(
  "webhook_endpoints",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    url: varchar({ length: 500 }).notNull(),
    events: text().array().notNull(),
    secretEncrypted: jsonb()
      .$type<{
        cipherText: string;
        iv: string;
        authTag: string;
        keyVersion: number;
      }>()
      .notNull(),
    status: varchar({ length: 12 }).default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("webhook_endpoints_business_idx").on(table.businessId)],
);

export const webhookDeliveries = pgTable(
  "webhook_deliveries",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    endpointId: integer("endpoint_id")
      .notNull()
      .references(() => webhookEndpoints.id, { onDelete: "cascade" }),
    event: varchar({ length: 40 }).notNull(),
    payload: jsonb().$type<Record<string, unknown>>().notNull(),
    status: varchar({ length: 10 }).default("pending").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(5).notNull(),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    responseStatus: integer("response_status"),
    lastError: text(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("webhook_deliveries_due_idx").on(table.status, table.nextAttemptAt),
    index("webhook_deliveries_endpoint_idx").on(table.endpointId),
  ],
);
