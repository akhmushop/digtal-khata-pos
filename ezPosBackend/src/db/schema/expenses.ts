import {
  pgTable,
  foreignKey,
  index,
  serial,
  integer,
  text,
  timestamp,
  varchar,
  numeric,
  date,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { expenseCategories } from "./expenseCategories.js";
import { businesses } from "./businesses.js";

export const expenses = pgTable(
  "expenses",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
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
    index("expenses_business_id_idx").on(table.businessId),
    foreignKey({
      columns: [table.categoryId, table.businessId],
      foreignColumns: [expenseCategories.id, expenseCategories.businessId],
      name: "expenses_category_business_fkey",
    }),
    check("expenses_amount_check", sql`amount >= (0)::numeric`),
    check(
      "expenses_payment_method_check",
      sql`(payment_method)::text = ANY ((ARRAY['Cash'::character varying, 'Mobile'::character varying, 'Card'::character varying])::text[])`,
    ),
  ],
);
