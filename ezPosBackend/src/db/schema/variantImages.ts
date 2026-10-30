import {
  foreignKey,
  index,
  boolean,
  integer,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { productVariants } from "./productVariants.js";
import { businesses } from "./businesses.js";

export const variantImages = pgTable(
  "variant_images",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    variantId: integer("variant_id"),
    imageUrl: varchar("image_url", { length: 255 }).notNull(),
    is_primary: boolean("is_primary").default(false),
    sortOrder: integer("sort_order").default(0),
  },
  (table) => [
    index("variant_images_business_id_idx").on(table.businessId),
    foreignKey({
      columns: [table.variantId, table.businessId],
      foreignColumns: [productVariants.id, productVariants.businessId],
      name: "variant_images_variant_business_fkey",
    }),
  ],
);
