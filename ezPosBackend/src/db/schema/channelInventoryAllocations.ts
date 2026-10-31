import {
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { allocationModeEnum } from "./commerceEnums.js";
import { businesses } from "./businesses.js";
import { integrations } from "./integrations.js";
import { locations } from "./locations.js";
import { productVariants } from "./productVariants.js";

/**
 * Per-channel stock allocation. `shared` (default, no row needed) exposes
 * all available stock to the storefront; `reserved` caps the storefront at
 * allocatedQty while physical keeps the rest (architecture doc §4).
 */
export const channelInventoryAllocations = pgTable(
  "channel_inventory_allocations",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    integrationId: integer("integration_id")
      .notNull()
      .references(() => integrations.id, { onDelete: "cascade" }),
    variantId: integer("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    locationId: integer("location_id").references(() => locations.id, {
      onDelete: "cascade",
    }),
    mode: allocationModeEnum("mode").default("shared").notNull(),
    allocatedQty: integer("allocated_qty").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("channel_allocations_integration_idx").on(table.integrationId),
    unique("channel_allocations_unique").on(
      table.integrationId,
      table.variantId,
      table.locationId,
    ),
  ],
);
