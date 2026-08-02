import {
  pgTable,
  foreignKey,
  serial,
  integer,
  text,
  timestamp,
  varchar,
  numeric,
} from "drizzle-orm/pg-core";
import { sales } from "./sales.js";
export const saleRefunds = pgTable(
  "sale_refunds",
  {
    id: serial().primaryKey().notNull(),
    saleId: integer("sale_id"),
    reason: text(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    status: varchar({ length: 20 }),
    refundTotal: numeric("refund_total", { mode: "number" }),
  },
  (table) => [
    foreignKey({
      columns: [table.saleId],
      foreignColumns: [sales.id],
      name: "refunds_sale_id_fkey",
    }),
  ],
);
