import { integer, pgTable, serial, timestamp, unique } from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";
import { roles } from "./roles.js";
import { users } from "./users.js";

/**
 * Role assignments. A user holds zero or more roles per business; effective
 * permissions are the union of every held role's permissions. Roles are
 * business-scoped (roles.business_id), so rows are keyed by
 * (business_id, user_id, role_id).
 *
 * businessMemberships.roleId remains the PRIMARY (display) role and is kept
 * in sync with the first assignment by the services that mutate this table.
 */
export const userRoles = pgTable(
  "user_roles",
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
      .references(() => roles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("user_roles_business_user_role_unique").on(
      table.businessId,
      table.userId,
      table.roleId,
    ),
  ],
);
