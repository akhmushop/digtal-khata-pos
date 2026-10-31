import express from "express";
import * as subscriptionPlansController from "./subscriptionPlans.controller.js";
import * as adminController from "./subscriptionPlans.admin.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requirePlatformAdmin } from "../../middleware/platformAdmin.js";

const router = express.Router();

// Public pricing catalog (marketing website). Unauthenticated by design.
router.get(
  "/api/subscription-plans",
  subscriptionPlansController.getSubscriptionPlans,
);

// SaaS-owner plan management — platform admins only (Phase 6 adds the UI;
// the endpoints are the foundation). Account-level role, not business RBAC.
const admin = [requireAuth, requirePlatformAdmin] as const;
router.get("/api/saas/plans", ...admin, adminController.getAllPlansAdmin);
router.post("/api/saas/plans", ...admin, adminController.createPlanAdmin);
router.patch("/api/saas/plans/:planId", ...admin, adminController.updatePlanAdmin);
router.delete("/api/saas/plans/:planId", ...admin, adminController.deletePlanAdmin);

export default router;
