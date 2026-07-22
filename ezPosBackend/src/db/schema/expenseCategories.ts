import { pgTable, serial, varchar, unique } from "drizzle-orm/pg-core";
export const expenseCategories = pgTable(
  "expense_categories",
  {
    id: serial().primaryKey().notNull(),
    categoryName: varchar("category_name", { length: 100 }).notNull(),
  },
  (table) => [
    unique("expense_categories_category_name_key").on(table.categoryName),
  ],
);
