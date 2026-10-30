import {
  index,
  integer,
  pgTable,
  serial,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";

export const expenseCategories = pgTable(
  "expense_categories",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    categoryName: varchar("category_name", { length: 100 }).notNull(),
  },
  (table) => [
    index("expense_categories_business_id_idx").on(table.businessId),
    // Per-business uniqueness — two businesses may both define "Rent".
    unique("expense_categories_business_name_unique").on(
      table.businessId,
      table.categoryName,
    ),
    unique("expense_categories_id_business_uq").on(table.id, table.businessId),
  ],
);

