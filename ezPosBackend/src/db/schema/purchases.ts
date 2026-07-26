import {
  pgTable,
  foreignKey,
  serial,
  integer,
  text,
  timestamp,
  varchar,
  numeric,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { paymentStatusEnum, statusEnum } from "../../types/purchases-type.js";

export const purchases = pgTable("purchases", {
  id: serial().primaryKey().notNull(),
  supplierName: varchar("supplier_name", { length: 255 }),
  subtotal: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
  discount: numeric({ precision: 10, scale: 2 }).default("0").notNull(),
  finalTotal: numeric("final_total", { precision: 10, scale: 2, mode:'number' })
    .default(0)
    .notNull(),
  paidAmount: numeric("paid_amount", {
    precision: 10,
    scale: 2,
    mode: "number",
  })
    .default(0)
    .notNull(),
  dueAmount: numeric("due_amount", { precision: 10, scale: 2, mode: "number" })
    .default(0)
    .notNull(),
  paymentStatus: paymentStatusEnum("payment_status")
    .default("unpaid")
    .notNull(),
  note: text(),
  createdAt: timestamp("created_at", { mode: "string" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  status: statusEnum("status").default("ordered").notNull(),
});
