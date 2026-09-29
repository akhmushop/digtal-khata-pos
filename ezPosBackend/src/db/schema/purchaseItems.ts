import {
  pgTable,
  foreignKey,
  serial,
  integer,
  numeric,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { purchases } from "./purchases.js";
import { productVariants } from "./productVariants.js";

export const purchaseItems = pgTable("purchase_items", {
  id: serial("id").primaryKey().notNull(),
  purchaseId: integer("purchase_id")
    .notNull()
    .references(() => purchases.id),
  variantId: integer("variant_id")
    .notNull()
    .references(() => productVariants.id),
  quantity: numeric("quantity", {
    precision: 12,
    scale: 3,
    mode: "number",
  }).notNull(),
  receivedQuantity: numeric("received_quantity", {
    precision: 12,
    scale: 3,
    mode: "number",
  }).notNull(),
  cancelledQuantity: numeric("cancelled_quantity   ", {
    precision: 12,
    scale: 3,
    mode: "number",
  })
    .notNull()
    .default(0),
  unitCost: numeric("unit_cost", {
    precision: 12,
    scale: 2,
    mode: "number",
  }).notNull(),
  discount: numeric("discount", { precision: 12, scale: 2, mode: "number" })
    .notNull()
    .default(0),
  tax: numeric("tax", { precision: 12, scale: 2, mode: "number" })
    .notNull()
    .default(0),
  total: numeric("total", { precision: 12, scale: 2, mode: "number" })
    .notNull()
    .generatedAlwaysAs(sql`( (quantity * unit_cost) - discount + tax )`),
});
