import {
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { productVariants } from "./productVariants.js";
import { inventoryBatches } from "./inventoryBatches.js";
import { purchaseItems } from "./purchaseItems.js";
import { saleItems } from "./saleItems.js";
export const serialStatusEnum = pgEnum("serial_status", [
  "in_stock", // 1. Sitting on the shelf, available to be sold.
  "reserved", // 2. Held for a specific customer order or quote (not available for normal sale).
  "sold", // 3. Sold to a customer and left the store.
  "returned", // 4. Customer brought it back (needs inspection before it can be 'in_stock' again).
  "in_repair", // 5. Sent to the manufacturer or IT department for fixing.
  "damaged", // 6. Broken, cannot be sold, waiting to be written off.
  "lost", // 7. Missing during stocktake (inventory shrinkage).
]);
export const serialNumbers = pgTable("serial_numbers", {
  id: serial("id").primaryKey().notNull(),
  variantId: integer("variant_id")
    .references(() => productVariants.id)
    .notNull(),
  batchId: integer("batch_id").references(() => inventoryBatches.id),
  serialNumber: varchar("serial_number", { length: 100 }).notNull().unique(),
  status: serialStatusEnum("status").default("in_stock").notNull(),
  purchaseItemId: integer("purchase_item_id").references(
    () => purchaseItems.id,
  ),
  saleItemId: integer("sale_item_id").references(() => saleItems.id),
  soldAt: timestamp("sold_at", { withTimezone: true }),
});
