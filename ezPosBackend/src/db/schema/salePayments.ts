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
import { customers } from "./customers.js";

export const salePayments = pgTable(
  "sale_payments",
  {
    id: serial().primaryKey().notNull(),
    saleId: integer("sale_id"),
    customerId: integer("customer_id"),
    paidAmount: numeric("paid_amount", {
      precision: 10,
      scale: 2,
      mode: "number",
    }),
    paymentMethod: varchar("payment_method", { length: 50 }),
    paymentDate: timestamp("payment_date", { mode: "string" }).defaultNow(),
    notes: text(),
  },
  (table) => [
    foreignKey({
      columns: [table.saleId],
      foreignColumns: [sales.id],
      name: "sale_payments_sale_id_fkey",
    }),
    foreignKey({
      columns: [table.customerId],
      foreignColumns: [customers.id],
      name: "sale_payments_customer_id_fkey",
    }),
  ],
);
