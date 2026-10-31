import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { businessStatusEnum } from "./saasEnums.js";
import { businessModeEnum } from "./commerceEnums.js";
import { users } from "./users.js";

export const businesses = pgTable("businesses", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  slug: varchar({ length: 100 }).notNull().unique(),
  phone: varchar({ length: 20 }),
  email: varchar({ length: 255 }),
  address: text(),
  /** Operating model (Phase 9): gates product surfaces, not permissions. */
  mode: businessModeEnum("mode").default("physical_only").notNull(),
  /** Onboarding profile — free-form trade label (retail, grocery, ...). */
  businessType: varchar("business_type", { length: 50 }),
  country: varchar({ length: 50 }),
  /** Invoice/display currency and the business's IANA timezone. */
  currency: varchar({ length: 3 }).default("BDT").notNull(),
  timezone: varchar("timezone", { length: 64 }).default("Asia/Dhaka").notNull(),
  status: businessStatusEnum("status").default("active").notNull(),
  createdByUserId: integer("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
