import { index, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";

export const units = pgTable(
  "units",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    name: varchar({ length: 100 }).notNull(),
    abbreviation: varchar({ length: 20 }).notNull(),
  },
  (table) => [index("units_business_id_idx").on(table.businessId)],
);
