import {
  foreignKey,
  index,
  integer,
  pgTable,
  primaryKey,
} from "drizzle-orm/pg-core";
import { productVariants } from "./productVariants.js";
import { variantOptions } from "./variantOptions.js";
import { businesses } from "./businesses.js";

export const variantValues = pgTable(
  "variant_values",
  {
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    variantId: integer("variant_id").notNull(),
    optionId: integer("option_id").notNull(),
  },
  (table) => [
    index("variant_values_business_id_idx").on(table.businessId),
    primaryKey({
      columns: [table.variantId, table.optionId],
    }),
    foreignKey({
      columns: [table.variantId, table.businessId],
      foreignColumns: [productVariants.id, productVariants.businessId],
      name: "variant_values_variant_business_fkey",
    }),
    foreignKey({
      columns: [table.optionId, table.businessId],
      foreignColumns: [variantOptions.id, variantOptions.businessId],
      name: "variant_values_option_business_fkey",
    }),
  ],
);
