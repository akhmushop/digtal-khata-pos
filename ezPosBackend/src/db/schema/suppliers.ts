import {
  pgTable,
  text,
  timestamp,
  varchar,
  numeric,
  unique,
  bigserial,
  check,
  boolean,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const suppliers = pgTable(
  "suppliers",
  {
    id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
    supplierCode: varchar("supplier_code", { length: 30 }),
    name: varchar({ length: 150 }).notNull(),
    contactPerson: varchar("contact_person", { length: 150 }),
    phone: varchar({ length: 30 }),
    email: varchar({ length: 150 }),
    companyName: varchar("company_name", { length: 150 }),
    address: text(),
    openingBalance: numeric("opening_balance", {
      precision: 12,
      scale: 2,
    }).default("0"),
    openingBalanceType: varchar("opening_balance_type", { length: 10 }),
    status: boolean().default(true),
    note: text(),
    createdAt: timestamp("created_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
    updatedAt: timestamp("updated_at", { mode: "string" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
  (table) => [
    unique("suppliers_supplier_code_key").on(table.supplierCode),
    check(
      "suppliers_opening_balance_type_check",
      sql`(opening_balance_type)::text = ANY ((ARRAY['payable'::character varying, 'receivable'::character varying])::text[])`,
    ),
  ],
);
