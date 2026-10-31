import { asc, eq, sql } from "drizzle-orm";
import { db } from "../../db/schema/index.js";
import {
  subscriptionPlans,
  type PlanFeatures,
  type PlanLimits,
} from "../../db/schema/subscriptionPlans.js";
import { subscriptions } from "../../db/schema/subscriptions.js";
import { ConflictError, NotFoundError } from "../../utils/handleError.js";
import type {
  CreatePlanInput,
  UpdatePlanInput,
} from "./subscriptionPlans.admin.validation.js";

/**
 * SaaS-owner plan management. Plans referenced by subscriptions are never
 * hard-deleted — deactivation (archival) keeps historical invoices and
 * subscriptions coherent.
 */

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "plan"
  );
}

export async function listAllPlansAdmin() {
  return db
    .select()
    .from(subscriptionPlans)
    .orderBy(asc(subscriptionPlans.sortOrder), asc(subscriptionPlans.id));
}

export async function createPlan(input: CreatePlanInput) {
  const slug = input.slug ?? slugify(input.name);
  const [existing] = await db
    .select({ id: subscriptionPlans.id })
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.slug, slug));
  if (existing) {
    throw new ConflictError("A plan with this slug already exists.");
  }

  const [created] = await db
    .insert(subscriptionPlans)
    .values({
      name: input.name,
      slug,
      description: input.description ?? null,
      interval: input.interval,
      price: input.price,
      currency: input.currency ?? "BDT",
      limits: input.limits,
      features: input.features,
      trialDays: input.trialDays ?? null,
      isPopular: input.isPopular ?? false,
      sortOrder: input.sortOrder ?? 0,
      supportLevel: input.supportLevel ?? null,
      isActive: input.isActive ?? true,
    })
    .returning();
  if (!created) {
    throw new Error("Plan insert returned no row.");
  }
  return created;
}

export async function updatePlan(planId: number, input: UpdatePlanInput) {
  const [existing] = await db
    .select({ id: subscriptionPlans.id })
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId));
  if (!existing) {
    throw new NotFoundError("Plan not found.");
  }

  const [updated] = await db
    .update(subscriptionPlans)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.interval !== undefined ? { interval: input.interval } : {}),
      ...(input.price !== undefined ? { price: input.price } : {}),
      ...(input.currency !== undefined ? { currency: input.currency } : {}),
      ...(input.limits !== undefined ? { limits: input.limits } : {}),
      ...(input.features !== undefined ? { features: input.features } : {}),
      ...(input.trialDays !== undefined ? { trialDays: input.trialDays } : {}),
      ...(input.isPopular !== undefined
        ? { isPopular: input.isPopular }
        : {}),
      ...(input.sortOrder !== undefined
        ? { sortOrder: input.sortOrder }
        : {}),
      ...(input.supportLevel !== undefined
        ? { supportLevel: input.supportLevel }
        : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      updatedAt: new Date(),
    })
    .where(eq(subscriptionPlans.id, planId))
    .returning();
  if (!updated) {
    throw new Error("Plan update returned no row.");
  }
  return updated;
}

/**
 * Archival delete: plans referenced by any subscription are deactivated
 * only; unreferenced plans are removed outright to keep the catalog clean.
 */
export async function deleteOrArchivePlan(planId: number) {
  const [existing] = await db
    .select({ id: subscriptionPlans.id })
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId));
  if (!existing) {
    throw new NotFoundError("Plan not found.");
  }

  const [referenced] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(
      // Current or scheduled (pending downgrade) references both block a
      // hard delete — clearing a scheduled change silently would be wrong.
      sql`(${subscriptions.planId} = ${planId} or ${subscriptions.pendingPlanId} = ${planId})`,
    )
    .limit(1);

  if (referenced) {
    await db
      .update(subscriptionPlans)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(subscriptionPlans.id, planId));
    return { deleted: false, archived: true };
  }

  await db
    .delete(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId));
  return { deleted: true, archived: false };
}
