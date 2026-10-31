import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { reservationStatusEnum } from "./commerceEnums.js";
import { businesses } from "./businesses.js";
import { integrations } from "./integrations.js";
import { inventoryStock } from "./inventoryStock.js";
import { locations } from "./locations.js";
import { productVariants } from "./productVariants.js";
import { sales } from "./sales.js";

/**
 * Online-channel stock holds. An active reservation reduces the stock that
 * storefronts may sell (onlineAvailable) while leaving physical POS free to
 * sell its own shelf — with the documented edge case that physical
 * overselling of reserved stock makes the online confirmation fail and
 * surface for manual resolution (architecture doc §4).
 *
 * `inventory_stock.reserved_quantity` is maintained by this service as the
 * per-stock-row sum of active reservations (the column existed unused).
 */
export const inventoryReservations = pgTable(
  "inventory_reservations",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    locationId: integer("location_id").references(() => locations.id, {
      onDelete: "set null",
    }),
    saleId: integer("sale_id").references(() => sales.id, {
      onDelete: "cascade",
    }),
    integrationId: integer("integration_id").references(
      () => integrations.id,
      { onDelete: "set null" },
    ),
    stockId: integer("stock_id")
      .notNull()
      .references(() => inventoryStock.id),
    quantity: integer().notNull(),
    status: reservationStatusEnum("status").default("active").notNull(),
    /** Stable key making duplicate storefront submissions idempotent. */
    idempotencyKey: varchar("idempotency_key", { length: 120 }).unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("inventory_reservations_stock_idx").on(table.stockId),
    index("inventory_reservations_sale_idx").on(table.saleId),
    index("inventory_reservations_expiry_idx").on(table.expiresAt),
    // One reservation per idempotency key among live rows.
    uniqueIndex("inventory_reservations_idempotency_active_uq")
      .on(table.idempotencyKey)
      .where(sql`status in ('active','confirmed')`),
  ],
);
