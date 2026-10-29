import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { businessStatusEnum } from "./saasEnums.js";
import { users } from "./users.js";

export const businesses = pgTable("businesses", {
  id: serial().primaryKey().notNull(),
  name: varchar({ length: 100 }).notNull(),
  slug: varchar({ length: 100 }).notNull().unique(),
  phone: varchar({ length: 20 }),
  email: varchar({ length: 255 }),
  address: text(),
  status: businessStatusEnum("status").default("active").notNull(),
  createdByUserId: integer("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});
