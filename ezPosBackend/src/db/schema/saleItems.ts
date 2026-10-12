import { pgTable, serial, integer, text, numeric } from "drizzle-orm/pg-core";
import { sales } from "./sales.js";
import { productVariants } from "./productVariants.js";

export const saleItems = pgTable("sale_items", {
  id: serial("id").primaryKey().notNull(),

  saleId: integer("sale_id")
    .notNull()
    .references(() => sales.id, { onDelete: "cascade" }),

  variantId: integer("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  sellingPrice: numeric("selling_price", {
    precision: 12,
    scale: 2,
    mode: "number",
  }).notNull(),
  discount: numeric("discount", { precision: 12, scale: 2, mode: "number" })
    .default(0)
    .notNull(),
  // productNameAtSale: text("product_name_at_sale").notNull(),
  costAtSale: numeric("cost_at_sale", {
    precision: 12,
    scale: 2,
    mode: "number",
  }).notNull(),
  lineTotal: numeric("line_total", {
    precision: 12,
    scale: 2,
    mode: "number",
  }).notNull(),
});
