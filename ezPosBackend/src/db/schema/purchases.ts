import {
  foreignKey,
  index,
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  varchar,
  numeric,
  pgSequence,
  unique,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { paymentStatusEnum, statusEnum } from "./enums.js";
import { suppliers } from "./suppliers.js";
import { businesses } from "./businesses.js";
import { locations } from "./locations.js";
// 1. purchaseInvoice Sequence
export const purchaseOrderSeq = pgSequence("purchase_order_seq", {
  startWith: 1,
  increment: 1,
});
export const purchases = pgTable(
  "purchases",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    supplierId: integer("supplier_id").references(() => suppliers.id),
    purchaseOrderNumber: varchar("purchase_order_number", { length: 50 })
      .notNull()
      .default(
        sql`'PO-' || to_char(CURRENT_DATE, 'YYYY') || '-' ||
        lpad(nextval('purchase_order_seq')::text, 6, '0')`,
      ),
    purchaseDate: timestamp("purchase_date").defaultNow().notNull(),
    subtotal: numeric({ precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    discount: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
    tax: numeric({ precision: 10, scale: 2 }).notNull().default("0"),
    shippingCost: numeric("shipping_cost", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
    totalAmount: numeric("total_amount", {
      precision: 10,
      scale: 2,
      mode: "number",
    })
      .default(0)
      .notNull(),
    paidAmount: numeric("paid_amount", {
      precision: 10,
      scale: 2,
      mode: "number",
    })
      .default(0)
      .notNull(),
    dueAmount: numeric("due_amount", {
      precision: 10,
      scale: 2,
      mode: "number",
    })
      .default(0)
      .notNull(),
    status: statusEnum("status").default("ordered").notNull(),
    paymentStatus: paymentStatusEnum("payment_status")
      .default("unpaid")
      .notNull(),
    notes: text(),
    // Owning outlet for this transaction. Nullable for legacy rows; the
    // application always sets it on new writes. Composite FK guarantees the
    // location belongs to the same business.
    locationId: integer("location_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.locationId, table.businessId],
      foreignColumns: [locations.id, locations.businessId],
      name: "purchases_location_business_fkey",
    }),
    index("purchases_business_location_idx").on(table.businessId, table.locationId),
    index("purchases_business_id_idx").on(table.businessId),
    unique("purchases_id_business_uq").on(table.id, table.businessId),
    unique("purchases_business_po_unique").on(
      table.businessId,
      table.purchaseOrderNumber,
    ),
  ],
);
