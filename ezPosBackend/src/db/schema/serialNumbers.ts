import {
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { productVariants } from "./productVariants.js";
import { inventoryBatches } from "./inventoryBatches.js";
import { purchaseItems } from "./purchaseItems.js";
import { saleItems } from "./saleItems.js";

export const serialNumbers = pgTable("serial_numbers", {
  id: serial("id").primaryKey().notNull(),
  variantId: integer("variant_id")
    .references(() => productVariants.id)
    .notNull(),
  batchId: integer("batch_id")
    .references(() => inventoryBatches.id)
    .notNull(),
  serialNumber: varchar("serial_number", { length: 100 }).notNull(),
  status: varchar({ length: 30 }),
  purchaseItemId: integer("purchase_item_id").references(
    () => purchaseItems.id,
  ),
  saleItemId: integer("sale_item_id").references(() => saleItems.id),
  soldAt: timestamp("sold_at", { withTimezone: true }),
});
