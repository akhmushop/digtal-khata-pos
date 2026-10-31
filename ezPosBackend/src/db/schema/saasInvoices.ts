import { sql } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgTable,
  serial,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";
import { subscriptions } from "./subscriptions.js";

/**
 * Subscription invoices. Issued by the centralized subscription service
 * (plan changes, renewals); payment records reference them. Previously
 * issued invoices are never silently modified — corrections happen through
 * new documents or explicit status transitions.
 */
export const saasInvoices = pgTable(
  "saas_invoices",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "restrict" }),
    subscriptionId: integer("subscription_id").references(
      () => subscriptions.id,
      { onDelete: "set null" },
    ),
    invoiceNumber: varchar("invoice_number", { length: 50 })
      .notNull()
      .default(
        sql`'INV-' || to_char(CURRENT_DATE, 'YYYY') || '-' ||
        lpad(nextval('saas_invoice_number_seq')::text, 6, '0')`,
      ),
    status: varchar({ length: 20 }).default("pending").notNull(),
    periodStart: timestamp("period_start", { withTimezone: true }),
    periodEnd: timestamp("period_end", { withTimezone: true }),
    subtotal: numeric({ precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    discount: numeric({ precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    vatAmount: numeric("vat_amount", { precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    total: numeric({ precision: 10, scale: 2, mode: "number" })
      .default(0)
      .notNull(),
    currency: varchar({ length: 3 }).default("BDT").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    dueAt: timestamp("due_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("saas_invoices_number_unique").on(table.invoiceNumber),
    index("saas_invoices_business_idx").on(table.businessId),
  ],
);
