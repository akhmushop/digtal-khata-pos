import {
  pgTable,
  foreignKey,
  serial,
  integer,
  timestamp,
  numeric,
} from "drizzle-orm/pg-core";
import { saleRefunds } from "./saleRefunds.js";

export const saleRefundItems = pgTable(
  "sale_refund_items",
  {
    id: serial().notNull(),
    refundId: integer("refund_id"),
    saleItemId: integer("sale_item_id"),
    productId: integer("product_id"),
    quantity: integer(),
    refundPrice: numeric("refund_price"),
    refundTotal: numeric("refund_total", { mode: "number" }),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.refundId],
      foreignColumns: [saleRefunds.id],
      name: "fk_sale_refunds_items",
    }),
  ],
);
