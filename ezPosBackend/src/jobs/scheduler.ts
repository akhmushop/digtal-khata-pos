import { env } from "../config/env.js";
import { runSubscriptionSweeps } from "./subscriptionJobs.js";

/**
 * In-process scheduler: sweeps subscription lifecycle jobs on a fixed
 * interval. Fine for a single instance; before horizontal scaling, move to
 * a dedicated worker (the sweeps themselves are SKIP LOCKED-safe already).
 */
let timer: NodeJS.Timeout | null = null;
let running = false;

export function startScheduler(): void {
  if (!env.jobsEnabled) {
    console.info("Background jobs disabled (JOBS_ENABLED=false).");
    return;
  }
  if (timer) return;
  const intervalMs = env.jobsIntervalMinutes * 60 * 1000;
  timer = setInterval(() => {
    if (running) return; // never overlap sweeps
    running = true;
    void runSubscriptionSweeps()
      .then((results) => {
        if (
          results.expiredTrials +
            results.trialReminders +
            results.renewalReminders +
            results.graceSuspensions >
          0
        ) {
          console.info("Subscription sweeps:", results);
        }
      })
      .catch((err) => console.error("Scheduled sweeps failed:", err))
      .finally(() => {
        running = false;
      });
  }, intervalMs);
  console.info(
    `Background jobs scheduled every ${env.jobsIntervalMinutes} minute(s).`,
  );
}

export function stopScheduler(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}
