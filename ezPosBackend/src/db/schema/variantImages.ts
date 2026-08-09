import { boolean, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { productVariants } from "./productVariants.js";

export const variantImages = pgTable("variant_images", {
  id: serial().primaryKey().notNull(),
  variantId: integer("variant_id").references(() => productVariants.id),
  imageUrl: varchar("image_url", { length: 255 }).notNull(),
  is_primary: boolean("is_primary").default(false),
  sortOrder: integer("sort_order").default(0),
});
