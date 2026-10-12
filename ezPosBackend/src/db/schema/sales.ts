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
  pgSequence,
  pgEnum,
} from "drizzle-orm/pg-core";
import { customers } from "./customers.js";
export const paymentStatusEnum = pgEnum("payment_status", [
  "paid",
  "partial",
  "unpaid",
]);
export const saleStatusEnum = pgEnum("sale_status", [
  "completed",
  "held",
  "cancelled",
  "refunded",
]);
export const saleInvoiceNumberSeq = pgSequence("sale_invoice_number_seq", {
  startWith: 1,
  increment: 1,
});
export const sales = pgTable("sales", {
  id: serial().primaryKey().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  status: saleStatusEnum("status").default("completed").notNull(),
  invoiceNumber: varchar("invoice_number", { length: 50 })
    .notNull()
    .unique()
    .default(
      sql`'INV-' || to_char(CURRENT_DATE, 'YYYY') || '-' ||
        lpad(nextval('sale_invoice_number_seq')::text, 6, '0')`,
    ),
  saleDate: timestamp("purchase_date").defaultNow().notNull(),
  subtotal: numeric({ precision: 10, scale: 2, mode: "number" }),
  discount: numeric({ precision: 10, scale: 2, mode: "number" }).default(0),
  vat: numeric({ precision: 10, scale: 2, mode: "number" }).default(0),
  finalTotal: numeric("final_total", { precision: 10, scale: 2,mode:"number" }),
  paymentStatus: paymentStatusEnum("payment_status").default("paid").notNull(),
  dueAmount: numeric("due_amount", {
    precision: 10,
    scale: 2,
    mode: "number",
  }).default(0),
  note: text(),
  customerId: integer("customer_id").references(() => customers.id),
});
