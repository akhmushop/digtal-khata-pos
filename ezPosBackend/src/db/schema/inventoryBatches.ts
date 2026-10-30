import {
  foreignKey,
  index,
  pgTable,
  serial,
  integer,
  unique,
  varchar,
  numeric,
  date,
} from "drizzle-orm/pg-core";
import { purchaseItems } from "./purchaseItems.js";
import { productVariants } from "./productVariants.js";
import { locations } from "./locations.js";
import { businesses } from "./businesses.js";

export const inventoryBatches = pgTable(
  "inventory_batches",
  {
    id: serial("id").primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    variantId: integer("variant_id"),
    locationId: integer("location_id"),
    purchaseItemId: integer("purchase_item_id"),
    batchNumber: varchar("batch_number", { length: 100 }).notNull(),

    purchasePrice: numeric("purchase_price", {
      precision: 10,
      scale: 2,
      mode: "number",
    }).notNull(),

    quantityReceived: integer("quantity_received").notNull(),
    quantityRemaining: integer("quantity_remaining").notNull(),

    manufacturedDate: date("manufactured_date", { mode: "date" }),
    expiryDate: date("expiry_date", { mode: "date" }),
  },
  (table) => [
    index("inventory_batches_business_id_idx").on(table.businessId),
    unique("inventory_batches_id_business_uq").on(table.id, table.businessId),
    foreignKey({
      columns: [table.variantId, table.businessId],
      foreignColumns: [productVariants.id, productVariants.businessId],
      name: "inventory_batches_variant_business_fkey",
    }),
    foreignKey({
      columns: [table.locationId, table.businessId],
      foreignColumns: [locations.id, locations.businessId],
      name: "inventory_batches_location_business_fkey",
    }),
    foreignKey({
      columns: [table.purchaseItemId, table.businessId],
      foreignColumns: [purchaseItems.id, purchaseItems.businessId],
      name: "inventory_batches_purchase_item_business_fkey",
    }),
  ],
);
