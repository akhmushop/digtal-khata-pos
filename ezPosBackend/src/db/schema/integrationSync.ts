import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";
import { integrations } from "./integrations.js";
import { productVariants } from "./productVariants.js";
import { products } from "./products.js";
import { sales } from "./sales.js";

/** AES-256-GCM encrypted WooCommerce API credentials. Never returned. */
export const integrationCredentials = pgTable(
  "integration_credentials",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    integrationId: integer("integration_id")
      .notNull()
      .references(() => integrations.id, { onDelete: "cascade" })
      .unique(),
    cipherText: text("cipher_text").notNull(),
    iv: varchar({ length: 32 }).notNull(),
    authTag: varchar("auth_tag", { length: 32 }).notNull(),
    keyVersion: integer("key_version").default(1).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("integration_credentials_business_idx").on(table.businessId)],
);

/** ezPos product ↔ WooCommerce product (id-based, never name/SKU matching). */
export const integrationProductMappings = pgTable(
  "integration_product_mappings",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    integrationId: integer("integration_id")
      .notNull()
      .references(() => integrations.id, { onDelete: "cascade" }),
    ezProductId: integer("ez_product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    externalProductId: varchar("external_product_id", { length: 64 })
      .notNull(),
    externalParentId: varchar("external_parent_id", { length: 64 }),
    lastPushedAt: timestamp("last_pushed_at", { withTimezone: true }),
    lastPulledAt: timestamp("last_pulled_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("integration_product_mappings_unique").on(
      table.integrationId,
      table.ezProductId,
    ),
    index("integration_product_mappings_external_idx").on(
      table.integrationId,
      table.externalProductId,
    ),
  ],
);

/** ezPos variant ↔ WooCommerce variation. */
export const integrationVariantMappings = pgTable(
  "integration_variant_mappings",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    integrationId: integer("integration_id")
      .notNull()
      .references(() => integrations.id, { onDelete: "cascade" }),
    ezVariantId: integer("ez_variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    externalVariationId: varchar("external_variation_id", { length: 64 }),
    externalProductId: varchar("external_product_id", { length: 64 }),
    lastPushedAt: timestamp("last_pushed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("integration_variant_mappings_unique").on(
      table.integrationId,
      table.ezVariantId,
    ),
    index("integration_variant_mappings_external_idx").on(
      table.integrationId,
      table.externalVariationId,
    ),
  ],
);

/** WooCommerce order ↔ ezPos sale, with status-version replay protection. */
export const integrationOrderMappings = pgTable(
  "integration_order_mappings",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    integrationId: integer("integration_id")
      .notNull()
      .references(() => integrations.id, { onDelete: "cascade" }),
    saleId: integer("sale_id")
      .notNull()
      .references(() => sales.id, { onDelete: "cascade" }),
    externalOrderId: varchar("external_order_id", { length: 64 }).notNull(),
    externalOrderNumber: varchar("external_order_number", { length: 64 }),
    statusVersion: integer("status_version").default(0).notNull(),
    lastWebhookAt: timestamp("last_webhook_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("integration_order_mappings_external_unique").on(
      table.integrationId,
      table.externalOrderId,
    ),
    index("integration_order_mappings_sale_idx").on(table.saleId),
  ],
);

/** Reliable sync queue — processed by the scheduler with backoff/dead-letter. */
export const integrationSyncJobs = pgTable(
  "integration_sync_jobs",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    integrationId: integer("integration_id")
      .notNull()
      .references(() => integrations.id, { onDelete: "cascade" }),
    jobType: varchar("job_type", { length: 40 }).notNull(),
    payload: jsonb().$type<Record<string, unknown>>(),
    status: varchar({ length: 12 }).default("queued").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(5).notNull(),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastError: text(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("integration_sync_jobs_due_idx").on(table.status, table.nextAttemptAt),
  ],
);

/** Append-only sync history for the integrations dashboard. */
export const integrationSyncLogs = pgTable(
  "integration_sync_logs",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    integrationId: integer("integration_id")
      .notNull()
      .references(() => integrations.id, { onDelete: "cascade" }),
    jobType: varchar("job_type", { length: 40 }).notNull(),
    direction: varchar({ length: 10 }).notNull(),
    entityType: varchar("entity_type", { length: 30 }),
    entityId: integer("entity_id"),
    status: varchar({ length: 10 }).notNull(),
    message: text(),
    payload: jsonb().$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("integration_sync_logs_integration_idx").on(
      table.integrationId,
      table.createdAt,
    ),
  ],
);
