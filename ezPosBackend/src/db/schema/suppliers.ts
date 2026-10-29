import {
  foreignKey,
  index,
  integer,
  pgTable,
  serial,
  text,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";

export const suppliers = pgTable(
  "suppliers",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id),
    name: varchar({ length: 100 }).notNull(),
    phone: varchar({ length: 20 }),
    email: varchar({ length: 255 }),
    address: text(),
    status: varchar({ length: 50 }).default("active"),
  },
  (table) => [
    index("suppliers_business_id_idx").on(table.businessId),
    unique("suppliers_id_business_uq").on(table.id, table.businessId),
  ],
);

