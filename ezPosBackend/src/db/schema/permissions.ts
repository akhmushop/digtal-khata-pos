import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const permissions = pgTable("permissions", {
  id: serial().primaryKey().notNull(),
  key: varchar({ length: 100 }).notNull().unique(),
  /** UI grouping (dashboard, pos, sales, products, …) from the catalog. */
  module: varchar({ length: 50 }),
  description: varchar({ length: 200 }),
});
