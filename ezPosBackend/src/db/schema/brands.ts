import { index, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";

export const brands = pgTable(
  "brands",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    name: varchar({ length: 100 }).notNull(),
    status: varchar({ length: 30 }),
  },
  (table) => [index("brands_business_id_idx").on(table.businessId)],
);
