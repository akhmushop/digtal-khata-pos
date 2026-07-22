import { sql } from "drizzle-orm";
import {
  pgTable,
  foreignKey,
  serial,
  integer,
  text,
  timestamp,
  varchar,
  numeric,
  unique,
  date,
} from "drizzle-orm/pg-core";
import { customers } from "../schema.js";
export const sales = pgTable(
  "sales",
  {
    id: serial().primaryKey().notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    status: varchar({ length: 30 }).default("completed"),
    invoiceNumber: varchar("invoice_number", { length: 50 }),
    saleDate: date("sale_date").default(sql`CURRENT_DATE`),
    subtotal: numeric({ precision: 10, scale: 2 }),
    discount: numeric({ precision: 10, scale: 2 }).default("0"),
    vat: numeric({ precision: 10, scale: 2 }).default("0"),
    finalTotal: numeric("final_total", { precision: 10, scale: 2 }),
    paymentStatus: varchar("payment_status", { length: 20 }).default("paid"),
    dueAmount: numeric("due_amount", { precision: 10, scale: 2 }).default("0"),
    note: text(),
    customerId: integer("customer_id"),
  },
  (table) => [
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: "sales_customer_id_fkey",
    }),
    unique("sales_invoice_number_key").on(table.invoiceNumber),
  ],
);
