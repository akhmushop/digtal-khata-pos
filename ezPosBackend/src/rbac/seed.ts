import { db } from "../db/schema/index.js";
import { permissions } from "../db/schema/permissions.js";
import { PERMISSION_CATALOG } from "./permissions.js";

let seedPromise: Promise<void> | null = null;

/**
 * Idempotently inserts the permission catalog into the `permissions` table.
 *
 * Kept in TypeScript (not SQL) so src/rbac/permissions.ts stays the single
 * source of truth — no SQL copy of the catalog can drift. Called once at
 * server startup and by the RBAC integration test suite.
 */
export async function ensureRbacSeed(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      await db
        .insert(permissions)
        .values(
          PERMISSION_CATALOG.map((p) => ({
            key: p.key,
            module: p.module,
            description: p.description,
          })),
        )
        .onConflictDoNothing({ target: permissions.key });
    })().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}
