import "server-only";
import { cacheLife } from "next/cache";
import {
  subscriptionPlansArraySchema,
  type SubscriptionPlan,
} from "@/lib/validations/subscription-plan";

export type SubscriptionPlansResult =
  | { status: "ok"; plans: SubscriptionPlan[] }
  | { status: "unavailable" };

/**
 * Fetches the public plan catalog from the ezPos backend.
 *
 * Cached with the `minutes` profile: pages using it stay prerendered while
 * the backend is rechecked in the background, so price changes appear
 * shortly after without making every visitor wait on the API.
 *
 * Never throws — a missing base URL, failed request, or malformed response
 * returns `unavailable` so prerendering succeeds and the UI can show a clear
 * message instead of falling back to misleading prices.
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlansResult> {
  "use cache";
  cacheLife("minutes");

  const baseUrl = process.env.API_BASE_URL;
  if (!baseUrl) return { status: "unavailable" };

  try {
    const response = await fetch(new URL("/api/subscription-plans", baseUrl), {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return { status: "unavailable" };

    const data: unknown = await response.json();
    const parsed = subscriptionPlansArraySchema.safeParse(data);
    return parsed.success
      ? { status: "ok", plans: parsed.data }
      : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}
