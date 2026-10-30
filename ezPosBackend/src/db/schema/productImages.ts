import {
  foreignKey,
  index,
  boolean,
  integer,
  pgTable,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { products } from "./products.js";
import { businesses } from "./businesses.js";

export const productImages = pgTable(
  "product_images",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    productId: integer("product_id"),
    imageUrl: varchar("image_url", { length: 255 }).notNull(),
    is_primary: boolean("is_primary").default(false),
    sortOrder: integer("sort_order").default(0),
  },
  (table) => [
    index("product_images_business_id_idx").on(table.businessId),
    foreignKey({
      columns: [table.productId, table.businessId],
      foreignColumns: [products.id, products.businessId],
      name: "product_images_product_business_fkey",
    }),
  ],
);
