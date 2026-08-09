import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const units = pgTable("units", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  abbreviation: varchar({ length: 20 }).notNull(),
});
