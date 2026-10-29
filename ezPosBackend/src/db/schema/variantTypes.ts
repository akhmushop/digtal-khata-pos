import { index, integer, pgTable, serial, unique, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";

export const variantTypes = pgTable(
  "variant_types",
  {
    id: serial("id").primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    name: varchar("name", { length: 100 }).notNull(),
  },
  (table) => [
    index("variant_types_business_id_idx").on(table.businessId),
    unique("variant_types_id_business_uq").on(table.id, table.businessId),
  ],
);

