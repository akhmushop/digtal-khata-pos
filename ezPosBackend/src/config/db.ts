import "dotenv/config";
import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
import { Pool } from "pg";

// Credentials come exclusively from DATABASE_URL (see .env.example) — never
// from source. This mirrors the connection used by db/schema/index.ts.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
export type DbTransaction = PgTransaction<
  NodePgQueryResultHKT,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;
