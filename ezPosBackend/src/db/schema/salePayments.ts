import { sql } from "drizzle-orm";
import { check, integer, numeric, pgTable, serial, timestamp, unique, varchar,text } from "drizzle-orm/pg-core";
import { sales } from "./sales.js";
import { customers } from "./customers.js";

export const salePayments = pgTable(
  "sale_payments",
  {
    id: serial().primaryKey().notNull(),
    saleId: integer("sale_id").notNull().references(() => sales.id),
    customerId: integer("customer_id").references(() => customers.id),
    amount: numeric("amount", { precision: 10, scale: 2, mode: "number" }).notNull(),
    paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // cash | bangla_qr | card
    reference: varchar("reference", { length: 100 }),                   // digital transaction id
    tendered: numeric("tendered", { precision: 10, scale: 2, mode: "number" }), // cash only
    paymentDate: timestamp("payment_date", { mode: "string" }).defaultNow().notNull(),
    notes: text(),
  },
  (t) => [
    check("sale_payments_amount_positive", sql`${t.amount} > 0`),
    check("sale_payments_method_valid", sql`${t.paymentMethod} in ('cash','bangla_qr','card')`),
    unique("sale_payments_method_reference_unique").on(t.paymentMethod, t.reference),
  ],
);