import {
  foreignKey,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  varchar,
  numeric,
} from "drizzle-orm/pg-core";
import { sales } from "./sales.js";
import { businesses } from "./businesses.js";
export const saleRefunds = pgTable(
  "sale_refunds",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    saleId: integer("sale_id"),
    reason: text(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    status: varchar({ length: 20 }),
    refundTotal: numeric("refund_total", { mode: "number" }),
  },
  (table) => [
    index("sale_refunds_business_id_idx").on(table.businessId),
    unique("sale_refunds_id_business_uq").on(table.id, table.businessId),
    foreignKey({
      columns: [table.saleId, table.businessId],
      foreignColumns: [sales.id, sales.businessId],
      name: "refunds_sale_business_fkey",
    }),
  ],
);
