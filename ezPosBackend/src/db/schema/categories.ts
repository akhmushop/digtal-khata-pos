import {
  integer,
  pgTable,
  serial,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  description: varchar({ length: 200 }),
  parentId: integer("parent_id").references((): AnyPgColumn => categories.id),
  status: varchar({ length: 30 }),
});
