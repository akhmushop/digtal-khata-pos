import { integer, pgTable, serial, unique, varchar } from "drizzle-orm/pg-core";
import { businesses } from "./businesses.js";

export const documentSequences = pgTable(
  "document_sequences",
  {
    id: serial().primaryKey().notNull(),
    businessId: integer("business_id")
      .notNull()
      .references(() => businesses.id, { onDelete: "cascade" }),
    sequenceKey: varchar("sequence_key", { length: 50 }).notNull(),
    nextValue: integer("next_value").default(1).notNull(),
  },
  (table) => [
    unique("document_sequences_business_key_unique").on(
      table.businessId,
      table.sequenceKey,
    ),
  ],
);
