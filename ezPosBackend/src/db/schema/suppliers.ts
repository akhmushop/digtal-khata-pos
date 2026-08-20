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
  serial,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const suppliers = pgTable("suppliers", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  phone: varchar({ length: 20 }),
  email: varchar({ length: 255 }),
  address: text(),
  status: varchar({ length: 50 }).default("active"),
});
