import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const brands = pgTable("brands", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  status: varchar({ length: 30 }),
});
