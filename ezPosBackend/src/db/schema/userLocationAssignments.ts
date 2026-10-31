import { foreignKey, index, integer, pgTable, serial, timestamp, unique } from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";
import { locations } from "./locations.js";
import { users } from "./users.js";

/**
 * Location access grants. Location access is a SEPARATE check from
 * permissions: a user may hold sales.view yet only be allowed to see sales
 * of their assigned locations. Owners (wildcard holders) implicitly access
 * every location of their business and do not need rows here.
 */
export const userLocationAssignments = pgTable(
  "user_location_assignments",
  {
    id: serial().primaryKey().notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    locationId: integer("location_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("user_location_assignments_unique").on(
      table.businessId,
      table.userId,
      table.locationId,
    ),
    index("user_location_assignments_user_idx").on(table.businessId, table.userId),
    foreignKey({
      columns: [table.locationId, table.businessId],
      foreignColumns: [locations.id, locations.businessId],
      name: "user_location_assignments_location_business_fkey",
    }),
  ],
);
