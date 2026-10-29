import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  serial,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";

export const roles = pgTable(
  "roles",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id").references(() => businesses.id, {
      onDelete: "cascade",
    }),
    clonedFromRoleId: integer("cloned_from_role_id").references(
      (): AnyPgColumn => roles.id,
      { onDelete: "set null" },
    ),
    name: varchar({ length: 100 }).notNull(),
    slug: varchar({ length: 50 }).notNull(),
    isSystem: boolean("is_system").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("roles_business_slug_unique").on(table.businessId, table.slug),
    uniqueIndex("roles_system_slug_unique")
      .on(table.slug)
      .where(sql`${table.businessId} is null`),
  ],
);
