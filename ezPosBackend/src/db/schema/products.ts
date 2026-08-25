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
  pgSequence,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { categories } from "./categories.js";
import { brands } from "./brands.js";
import { units } from "./units.js";
// Sequence
export const productSkuSeq = pgSequence("product_sku_seq", {
  startWith: 1,
  increment: 1,
});
export const products = pgTable("products", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  brandId: integer("brand_id").references(() => brands.id),
  unitId: integer("unit_id").references(() => units.id),
  description: varchar({ length: 200 }),
  productType: varchar("product_type", { length: 20 }),
  hasVariants: boolean("has_variants").default(false),
  trackingType: varchar("tracking_type", { length: 20 }),
  status: varchar({ length: 30 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
