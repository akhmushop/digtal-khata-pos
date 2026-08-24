import {
  pgTable,
  serial,
  integer,
  varchar,
  numeric,
  date,
} from "drizzle-orm/pg-core";
import { purchaseItems } from "./purchaseItems.js";
import { productVariants } from "./productVariants.js";
import { locations } from "./locations.js";

export const inventoryBatches = pgTable("inventory_batches", {
  id: serial("id").primaryKey().notNull(),
  variantId: integer("variant_id").references(() => productVariants.id),
  locationId: integer("location_id").references(() => locations.id),
  purchaseItemId: integer("purchase_item_id").references(
    () => purchaseItems.id,
  ),
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
});
