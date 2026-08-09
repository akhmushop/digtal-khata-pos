import { boolean, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { products } from "./products.js";

export const productImages = pgTable("product_images", {
  id: serial().primaryKey().notNull(),
  productId: integer("product_id").references(() => products.id),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  is_primary: boolean("is_primary").default(false),
  sortOrder: integer("sort_order").default(0),
});
