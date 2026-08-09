import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const variantTypes = pgTable("variant_types", {
  id: serial("id").primaryKey().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
});
