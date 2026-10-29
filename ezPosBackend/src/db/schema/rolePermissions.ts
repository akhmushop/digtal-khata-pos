import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import { roles } from "./roles.js";
import { permissions } from "./permissions.js";

export const rolePermissions = pgTable(
  "role_permissions",
  {
    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: integer("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "restrict" }),
  },
  (table) => [
    primaryKey({
      name: "role_permissions_unique",
      columns: [table.roleId, table.permissionId],
    }),
  ],
);
