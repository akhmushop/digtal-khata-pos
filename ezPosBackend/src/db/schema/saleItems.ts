import {
  pgTable,
  foreignKey,
  serial,
  integer,
  text,
  varchar,
  numeric,
} from "drizzle-orm/pg-core";
import { sales } from "./sales.js";
import { products } from "./products.js";


export const saleItems = pgTable(
  "sale_items",
  {
    id: serial().primaryKey().notNull(),
    saleId: integer("sale_id"),
    productId: integer("product_id"),
    soldQuantity: integer("sold_quantity"),
    soldPrice: numeric("sold_price"),
    status: varchar({ length: 20 }).default("completed"),
    productNameAtSale: text("product_name_at_sale"),
    costAtSale: numeric("cost_at_sale", { precision: 10, scale: 2 }),
  },
  (table) => [
    foreignKey({
      columns: [table.saleId],
      foreignColumns: [sales.id],
      name: "sale_items_sale_id_fkey",
    }),
    foreignKey({
      columns: [table.productId],
      foreignColumns: [products.id],
      name: "sale_items_product_id_fkey",
    }),
  ],
);