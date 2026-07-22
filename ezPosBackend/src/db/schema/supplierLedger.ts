import {
  pgTable,
  foreignKey,
  text,
  timestamp,
  varchar,
  numeric,
  bigserial,
  bigint,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { suppliers } from "../schema.js";

export const supplierLedger = pgTable(
  "supplier_ledger",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    supplierId: bigint("supplier_id", { mode: "number" }).notNull(),
    transactionType: varchar("transaction_type", { length: 30 }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    referenceId: bigint("reference_id", { mode: "number" }),
    debit: numeric({ precision: 12, scale: 2 }).default("0"),
    credit: numeric({ precision: 12, scale: 2, mode: "number" }).default(0),
    note: text(),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.supplierId],
      foreignColumns: [suppliers.id],
      name: "supplier_ledger_supplier_id_fkey",
    }),
  ],
);
