import {
  foreignKey,
  index,
  integer,
  pgTable,
  serial,
  unique,
} from "drizzle-orm/pg-core";
import { productVariants } from "./productVariants.js";
import { locations } from "./locations.js";
import { businesses } from "./businesses.js";

export const inventoryStock = pgTable(
  "inventory_stock",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    variantId: integer("variant_id")
      .references(() => productVariants.id)
      .notNull(),
    locationId: integer("location_id").references(() => locations.id),
    quantity: integer().default(0),
    reservedQuantity: integer("reserved_quantity").default(0),
  },
  (table) => [
    index("inventory_stock_business_id_idx").on(table.businessId),
    foreignKey({
      columns: [table.variantId, table.businessId],
      foreignColumns: [productVariants.id, productVariants.businessId],
      name: "inventory_stock_variant_business_fkey",
    }),
    // PENDING POLICY DECISION (user, unresolved): `variant_id` stays globally
    // unique (one stock row per variant — the current single-location model).
    // The per-location model requires swapping this for
    // UNIQUE (business_id, variant_id, location_id) with a NOT NULL
    // location_id and a default location per business. Do not change until
    // the user confirms.
    unique("inventory_stock_variant_id_unique").on(table.variantId),
  ],
);
