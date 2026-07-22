import {
  pgTable,
  foreignKey,
  serial,
  integer,
  numeric,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { products } from "./products.js";
import { purchases } from "./purchases.js";

export const purchaseItems = pgTable(
  "purchase_items",
  {
    id: serial().primaryKey().notNull(),
    purchaseId: integer("purchase_id").notNull(),
    productId: integer("product_id").notNull(),
    quantity: numeric({ precision: 12, scale: 2 }).notNull(),
    costPrice: numeric("cost_price", {
      precision: 12,
      scale: 2,
      mode: "number",
    }).notNull(),
    totalCost: numeric("total_cost", {
      precision: 12,
      scale: 2,
    }).generatedAlwaysAs(sql`(quantity * cost_price)`),
    receiveQuantity: integer("receive_quantity").default(0),
  },
  (table) => [
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: "purchase_items_product_id_fkey",
    }),
    foreignKey({
      columns: [table.purchaseId],
      foreignColumns: [purchases.id],
      name: "purchase_items_purchase_id_fkey",
    }),
  ],
);
