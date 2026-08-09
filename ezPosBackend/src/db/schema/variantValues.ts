import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { productVariants } from "./productVariants.js";
import { variantOptions } from "./variantOptions.js";

export const variantValues = pgTable(
  "variant_values",
  {
    variantId: integer("variant_id")
      .references(() => productVariants.id)
      .notNull(),
    optionId: integer("option_id")
      .references(() => variantOptions.id)
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.variantId, table.optionId],
    }),
  ],
);
