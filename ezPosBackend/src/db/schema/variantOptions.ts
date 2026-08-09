import { integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { variantTypes } from "./variantTypes.js";

export const variantOptions = pgTable("variant_options", {
  id: serial("id").primaryKey().notNull(),
  variantTypeId: integer("variant_type_id")
    .references(() => variantTypes.id)
    .notNull(),
  value: varchar("value", { length: 100 }).notNull(),
});