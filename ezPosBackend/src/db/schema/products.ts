import {
  pgTable,
  serial,
  integer,
  varchar,
  numeric,
  jsonb,
  unique,
  doublePrecision,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const products = pgTable("products", {
  id: serial().primaryKey().notNull(),
  productName: varchar("product_name", { length: 100 }).notNull(),
  productUnit: varchar("product_unit", { length: 20 }),
  productType: varchar("product_type", { length: 20 }),
  description: varchar({ length: 200 }),
  brand: varchar({ length: 30 }),
  category: varchar({ length: 50 }),
  supplier: varchar({ length: 50 }),
  image: varchar({ length: 200 }),
  status: varchar({ length: 30 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  tags: jsonb(),
  hasVariants: boolean("has_variants").default(false),
});
