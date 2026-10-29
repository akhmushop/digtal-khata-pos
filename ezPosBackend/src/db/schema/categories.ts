import {
  index,
  integer,
  pgTable,
  serial,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";

export const categories = pgTable(
  "categories",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    name: varchar({ length: 100 }).notNull(),
    description: varchar({ length: 200 }),
    parentId: integer("parent_id").references((): AnyPgColumn => categories.id),
    status: varchar({ length: 30 }),
  },
  (table) => [index("categories_business_id_idx").on(table.businessId)],
);
