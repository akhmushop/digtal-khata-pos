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
import { purchases } from "./purchases.js";
import { suppliers } from "./suppliers.js";

export const purchaseReturns = pgTable(
  "purchase_returns",
  {
    id: serial().primaryKey().notNull(),
    purchaseId: integer("purchase_id").notNull(),
    supplierId: integer("supplier_id").notNull(),
    returnDate: timestamp("return_date", { mode: "string" })
      .defaultNow()
      .notNull(),
    reason: text(),
    status: varchar({ length: 20 }).default("pending").notNull(),
    totalAmount: numeric("total_amount", {
      precision: 12,
      scale: 2,
      mode: "number",
    })
      .default(0)
      .notNull(),
    createdAt: timestamp("created_at", { mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.purchaseId],
      foreignColumns: [purchases.id],
      name: "purchase_returns_purchase_id_fkey",
    }),
    foreignKey({
      columns: [table.supplierId],
      foreignColumns: [suppliers.id],
      name: "purchase_returns_supplier_id_fkey",
    }),
  ],
);