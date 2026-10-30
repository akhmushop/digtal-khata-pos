import express from "express";
import * as subscriptionPlansController from "./subscriptionPlans.controller.js";

const router = express.Router();
router.get(
  "/api/subscription-plans",
  subscriptionPlansController.getSubscriptionPlans,
);
export default router;
