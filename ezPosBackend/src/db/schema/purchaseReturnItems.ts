import {
  pgTable,
  foreignKey,
  serial,
  integer,
  numeric,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { products } from "./products.js";
import { purchaseReturns } from "./purchaseReturns.js";
import { purchaseItems } from "./purchaseItems.js";

export const purchaseReturnItems = pgTable(
  "purchase_return_items",
  {
    id: serial().primaryKey().notNull(),
    purchaseReturnId: integer("purchase_return_id").notNull(),
    purchaseItemId: integer("purchase_item_id").notNull(),
    productId: integer("product_id").notNull(),
    quantity: numeric({ precision: 10, scale: 2, mode: "number" }).notNull(),
    unitPrice: numeric("unit_price", {
      precision: 10,
      scale: 2,
      mode: "number",
    }).notNull(),
    lineTotal: numeric("line_total", {
      precision: 12,
      scale: 2,
    }).generatedAlwaysAs(sql`(quantity * unit_price)`),
  },
  (table) => [
    foreignKey({
      columns: [table.purchaseReturnId],
      foreignColumns: [purchaseReturns.id],
      name: "purchase_return_items_purchase_return_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.purchaseItemId],
      foreignColumns: [purchaseItems.id],
      name: "purchase_return_items_purchase_item_id_fkey",
    }),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: "purchase_return_items_product_id_fkey",
    }),
    check("purchase_return_items_quantity_check", sql`quantity > (0)::numeric`),
  ],
);
