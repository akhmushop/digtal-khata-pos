import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";

/**
 * A business outlet: store, warehouse, or head office. The product catalog,
 * customers, and suppliers are shared across all locations of a business;
 * inventory, sales, purchases, and expenses are location-scoped.
 */
export const locations = pgTable(
  "locations",
  {
    id: serial("id").primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    name: varchar("name", { length: 100 }).notNull(),
    locationCode: varchar("location_code", { length: 50 }),
    locationType: varchar("location_type", { length: 20 })
      .default("store")
      .notNull(),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    address: varchar("address", { length: 255 }),
    city: varchar("city", { length: 100 }),
    isDefault: boolean("is_default").default(false).notNull(),
    status: varchar("status", { length: 20 }).default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("locations_business_id_idx").on(table.businessId),
    unique("locations_id_business_uq").on(table.id, table.businessId),
    // Location codes are optional but unique within the business when set.
    unique("locations_business_code_unique").on(
      table.businessId,
      table.locationCode,
    ),
    // At most one default location per business.
    uniqueIndex("locations_one_default_per_business")
      .on(table.businessId)
      .where(sql`${table.isDefault}`),
  ],
);
