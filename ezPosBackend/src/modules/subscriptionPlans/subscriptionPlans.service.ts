import { asc, eq } from "drizzle-orm";
import { db } from "../../db/schema/index.js";
import { subscriptionPlans } from "../../db/schema/subscriptionPlans.js";

/**
 * Public catalog for the marketing website's pricing page.
 * Returns only active plans and only the fields needed for public display —
 * never internal flags or timestamps.
 */
export async function getPublicSubscriptionPlans() {
  return db
    .select({
      id: subscriptionPlans.id,
      name: subscriptionPlans.name,
      slug: subscriptionPlans.slug,
      interval: subscriptionPlans.interval,
      price: subscriptionPlans.price,
      currency: subscriptionPlans.currency,
      limits: subscriptionPlans.limits,
    })
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.isActive, true))
    .orderBy(asc(subscriptionPlans.price));
}
