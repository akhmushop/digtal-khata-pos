import { boolean, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { platformRoleEnum } from "./saasEnums.js";

export const users = pgTable("users", {
  id: serial().primaryKey().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 100 }).notNull(),
  phone: varchar({ length: 20 }),
  emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
  platformRole: platformRoleEnum("platform_role").default("none").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
