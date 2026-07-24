import {
  pgTable,
  foreignKey,
  serial,
  integer,
  text,
  timestamp,
  varchar,
  numeric,
  date,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { expenseCategories } from "./expenseCategories.js";

export const expenses = pgTable(
  "expenses",
  {
    id: serial().primaryKey().notNull(),
    title: varchar({ length: 255 }).notNull(),
    amount: numeric({ precision: 10, scale: 2, mode: "number" }).notNull(),
    categoryId: integer("category_id"),
    paymentMethod: varchar("payment_method", { length: 50 }),
    referenceNo: varchar("reference_no", { length: 100 }),
    note: text(),
    expenseDate: date("expense_date").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp("updated_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [expenseCategories.id],
      name: "expenses_category_id_fkey",
    }),
    check("expenses_amount_check", sql`amount >= (0)::numeric`),
    check(
      "expenses_payment_method_check",
      sql`(payment_method)::text = ANY ((ARRAY['Cash'::character varying, 'Mobile'::character varying, 'Card'::character varying])::text[])`,
    ),
  ],
);
