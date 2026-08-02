import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
export const customers = pgTable("customers", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 20 }),
  address: text(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
});
