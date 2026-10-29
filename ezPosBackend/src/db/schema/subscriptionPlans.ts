import {
  boolean,
  jsonb,
  numeric,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { billingIntervalEnum } from "./saasEnums.js";

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  slug: varchar({ length: 50 }).notNull().unique(),
  interval: billingIntervalEnum("interval").notNull(),
  price: numeric({ precision: 10, scale: 2, mode: "number" }).notNull(),
  currency: varchar({ length: 3 }).default("BDT").notNull(),
  limits: jsonb().$type<{
    maxUsers?: number;
    maxLocations?: number;
    maxProducts?: number;
  }>(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
