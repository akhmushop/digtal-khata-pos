import {
  foreignKey,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
  numeric,
  bigserial,
  bigint,
} from "drizzle-orm/pg-core";
import { suppliers } from "./suppliers.js";
import { businesses } from "./businesses.js";

export const supplierLedger = pgTable(
  "supplier_ledger",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    supplierId: bigint("supplier_id", { mode: "number" }).notNull(),
    transactionType: varchar("transaction_type", { length: 30 }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    // Polymorphic reference (purchase/payment) — cannot carry a foreign key;
    // ownership is enforced by the services that write it.
    referenceId: bigint("reference_id", { mode: "number" }),
    debit: numeric({ precision: 12, scale: 2 }).default("0"),
    credit: numeric({ precision: 12, scale: 2, mode: "number" }).default(0),
    note: text(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("supplier_ledger_business_id_idx").on(table.businessId),
    foreignKey({
      columns: [table.supplierId, table.businessId],
      foreignColumns: [suppliers.id, suppliers.businessId],
      name: "supplier_ledger_supplier_business_fkey",
    }),
  ],
);
