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
    refundPrice: numeric("refund_price", { mode: "number" }),
    refundTotal: numeric("refund_total", { mode: "number" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    foreignKey({
      columns: [table.refundId],
      foreignColumns: [saleRefunds.id],
      name: "fk_sale_refunds_items",
    }),
  ],
);
