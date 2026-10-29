import { integer, pgTable, serial, timestamp, unique } from "drizzle-orm/pg-core";
import { membershipStatusEnum } from "./saasEnums.js";
import { users } from "./users.js";
import { businesses } from "./businesses.js";
import { roles } from "./roles.js";

export const businessMemberships = pgTable(
  "business_memberships",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    status: membershipStatusEnum("status").default("active").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("business_memberships_user_business_unique").on(
      table.userId,
      table.businessId,
    ),
  ],
);
