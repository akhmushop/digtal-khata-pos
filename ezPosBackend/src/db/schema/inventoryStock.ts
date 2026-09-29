import { integer, pgTable, serial } from "drizzle-orm/pg-core";
import { productVariants } from "./productVariants.js";
import { locations } from "./locations.js";

export const inventoryStock = pgTable("inventory_stock", {
  id: serial().primaryKey().notNull(),
  variantId: integer("variant_id")
    .references(() => productVariants.id)
    .notNull()
    .unique(),
  locationId: integer("location_id").references(() => locations.id),
  quantity: integer().default(0),
  reservedQuantity: integer("reserved_quantity").default(0),
});
