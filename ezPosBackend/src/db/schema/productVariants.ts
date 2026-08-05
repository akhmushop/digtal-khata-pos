import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  primaryKey,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { products } from "./products.js";
import { purchases } from "./purchases.js";
import { sales } from "./sales.js";

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey().notNull(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  sku: varchar({ length: 100 }).unique(),
  barcode: varchar({ length: 100 }).unique(),
  quantity: integer().default(0).notNull(),
  alertQuantity: integer("alert_quantity").default(0),
  purchasePrice: numeric("purchase_price", {
    precision: 12,
    scale: 2,
  }).notNull(),
  sellingPrice: numeric("selling_price", {
    precision: 12,
    scale: 2,
  }).notNull(),
  discountPercent: numeric("discount_percent", {
    precision: 12,
    scale: 2,
  }).default("0"),
  flatDiscount: numeric("flat_discount", {
    precision: 12,
    scale: 2,
  }).default("0"),
  finalPrice: numeric("final_price", {
    precision: 12,
    scale: 2,
  }),
  batchNumber: varchar("batch_number", { length: 200 }),
  expiryDate: date("expiry_date"),
  weight: varchar({ length: 20 }),
  dimensions: varchar({ length: 80 }),
  image: varchar({ length: 200 }),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  status: varchar({ length: 30 }),
});
export const variantTypes = pgTable("variant_types", {
  id: serial("id").primaryKey().notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
export const variantOptions = pgTable("variant_options", {
  id: serial("id").primaryKey().notNull(),
  variantTypeId: integer("variant_type_id")
    .references(() => variantTypes.id)
    .notNull(),
  value: varchar("value", { length: 100 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
export const variantValues = pgTable(
  "variant_values",
  {
    variantId: integer("variant_id")
      .references(() => productVariants.id)
      .notNull(),
    optionId: integer("option_id")
      .references(() => variantOptions.id)
      .notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.variantId, table.optionId],
    }),
  ],
);
export const serialNumbers = pgTable("serial_numbers", {
  id: serial("id").primaryKey().notNull(),
  variantId: integer("variant_id")
    .references(() => productVariants.id)
    .notNull(),
  serialNumber: varchar("serial_number", { length: 100 }).notNull(),
  status: varchar({ length: 30 }),
  purchaseId: integer("purchase_id").references(() => purchases.id),
  saleId: integer("sale_id").references(() => sales.id),
  soldAt: timestamp("sold_at", { withTimezone: true }),
});
