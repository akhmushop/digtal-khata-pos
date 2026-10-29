import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const permissions = pgTable("permissions", {
  id: serial().primaryKey().notNull(),
  key: varchar({ length: 100 }).notNull().unique(),
  description: varchar({ length: 200 }),
});
