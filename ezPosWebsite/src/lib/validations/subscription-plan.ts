import { z } from "zod";

/**
 * Validates the public plan catalog returned by
 * GET ${API_BASE_URL}/api/subscription-plans (see
 * ezPosBackend/src/modules/subscriptionPlans/).
 * Mirrors the backend's selected fields — anything unexpected is rejected so
 * malformed data never reaches the pricing UI.
 */

const planLimitsSchema = z.object({
  maxUsers: z.number().int().positive().optional(),
  maxLocations: z.number().int().positive().optional(),
  maxProducts: z.number().int().positive().optional(),
});

export const subscriptionPlanSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  slug: z.string().min(1),
  interval: z.enum(["monthly", "yearly"]),
  price: z.number().nonnegative(),
  currency: z.string().length(3),
  limits: planLimitsSchema.nullish().transform((value) => value ?? null),
});

export const subscriptionPlansArraySchema = z.array(subscriptionPlanSchema);

export type PlanInterval = z.infer<typeof subscriptionPlanSchema>["interval"];

export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;
