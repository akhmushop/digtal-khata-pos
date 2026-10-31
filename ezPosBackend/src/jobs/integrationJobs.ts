import { eq, inArray, lt, or, sql } from "drizzle-orm";
import { db } from "../db/schema/index.js";
import { integrations } from "../db/schema/integrations.js";
import {
  processSyncJobs,
  pushStockLevels,
} from "../modules/integrations/integrations.service.js";

/**
 * Integration sweeps (Phase 9.3): process the sync queue (retries with
 * backoff, dead-lettering) and periodically push current availability to
 * connected WooCommerce stores so online channels reflect ezPos stock.
 */
export async function runIntegrationSweeps(now: Date = new Date()): Promise<{
  processedJobs: number;
  failedJobs: number;
  stockPushes: number;
}> {
  const results = { processedJobs: 0, failedJobs: 0, stockPushes: 0 };

  try {
    const jobs = await processSyncJobs(now);
    results.processedJobs = jobs.processed;
    results.failedJobs = jobs.failed;
  } catch (err) {
    console.error("Sync job sweep failed:", err);
  }

  try {
    // Stock push for connected WooCommerce stores whose last push is older
    // than 5 minutes (per-interval pacing independent of job retries).
    const due = await db
      .select({ id: integrations.id })
      .from(integrations)
      .where(
        sql`(${integrations.lastSyncAt} is null or ${integrations.lastSyncAt} < ${new Date(
          now.getTime() - 5 * 60_000,
        ).toISOString()})
        and ${integrations.status} = 'connected'`,
      )
      .limit(20);
    for (const integration of due) {
      try {
        results.stockPushes += await pushStockLevels(integration.id);
      } catch (err) {
        console.error(`Stock push failed for integration ${integration.id}:`, err);
      }
    }
  } catch (err) {
    console.error("Stock push sweep failed:", err);
  }

  return results;
}
