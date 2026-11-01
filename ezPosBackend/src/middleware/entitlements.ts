import type { NextFunction, Request, Response } from "express";
import { getEntitlements, type PlanFeatureKey } from "../services/entitlements.js";
import { getBusinessId } from "./business.js";

/**
 * Route-level feature gate: the business's current plan must include the
 * feature. Read-only (GET) so it works regardless of subscription access
 * mode — plan gating is orthogonal to trial-expiry gating (requireFullAccess).
 * Returns 403 FEATURE_NOT_IN_PLAN when the plan lacks the feature.
 */
export function requireFeature(feature: PlanFeatureKey) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const entitlements = await getEntitlements(getBusinessId(req));
      if (entitlements.plan?.features?.[feature] === true) {
        next();
        return;
      }
      return res.status(403).json({
        success: false,
        code: "FEATURE_NOT_IN_PLAN",
        message:
          "This feature is not part of your current plan. Upgrade to unlock it.",
      });
    } catch (err) {
      console.error("Feature check failed:", err);
      return res.status(500).json({
        success: false,
        message: "Unable to verify your plan entitlements right now.",
      });
    }
  };
}
