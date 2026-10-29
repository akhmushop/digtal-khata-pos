import { foreignKey, index, integer, pgTable, serial, unique, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";

export const locations = pgTable(
  "locations",
  {
    id: serial("id").primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    name: varchar("name", { length: 100 }).notNull(),
    address: varchar("address", { length: 255 }),
    status: varchar("status", { length: 20 }).default("active").notNull(),
  },
  (table) => [
    index("locations_business_id_idx").on(table.businessId),
    unique("locations_id_business_uq").on(table.id, table.businessId),
  ],
);

