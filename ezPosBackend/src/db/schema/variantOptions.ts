import {
  foreignKey,
  index,
  integer,
  pgTable,
  serial,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { variantTypes } from "./variantTypes.js";
import { businesses } from "./businesses.js";

export const variantOptions = pgTable(
  "variant_options",
  {
    id: serial("id").primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    variantTypeId: integer("variant_type_id").notNull(),
    value: varchar("value", { length: 100 }).notNull(),
  },
  (table) => [
    index("variant_options_business_id_idx").on(table.businessId),
    unique("variant_options_id_business_uq").on(table.id, table.businessId),
    foreignKey({
      columns: [table.variantTypeId, table.businessId],
      foreignColumns: [variantTypes.id, variantTypes.businessId],
      name: "variant_options_type_business_fkey",
    }),
  ],
);
