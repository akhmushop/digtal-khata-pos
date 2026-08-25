import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  primaryKey,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { products } from "./products.js";

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey().notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  sku: varchar({ length: 100 }).notNull().unique(),
  barcode: varchar({ length: 100 }).unique(),
  sellingPrice: numeric("selling_price", {
    precision: 12,
    scale: 2,
    mode: "number",
  }).notNull(),
  alertQuantity: integer("alert_quantity").default(0),
  isDefault: boolean("is_default").default(false),
  status: varchar({ length: 30 }),
});
