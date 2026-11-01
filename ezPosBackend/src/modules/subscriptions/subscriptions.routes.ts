import express from "express";
import * as portalController from "./subscriptions.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireBusinessAccess } from "../../middleware/business.js";

const router = express.Router();

// All portal routes verify the caller's active membership via the
// :businessId path param. NOTE: these deliberately DO NOT use
// requireFullAccess — the billing portal must stay reachable when a
// subscription has expired or been canceled.
const portal = [requireAuth, requireBusinessAccess()] as const;

router.post(
  "/api/businesses/:businessId/subscription/change-plan",
  ...portal,
  portalController.changeSubscriptionPlan,
);
router.post(
  "/api/businesses/:businessId/subscription/cancel",
  ...portal,
  portalController.cancelMySubscription,
);
router.post(
  "/api/businesses/:businessId/subscription/reactivate",
  ...portal,
  portalController.reactivateMySubscription,
);
router.post(
  "/api/businesses/:businessId/subscription/renew",
  ...portal,
  portalController.renewMySubscription,
);
router.get(
  "/api/businesses/:businessId/subscription/open",
  ...portal,
  portalController.getCurrentSubscription,
);
router.get(
  "/api/businesses/:businessId/invoices",
  ...portal,
  portalController.getInvoices,
);
router.get(
  "/api/businesses/:businessId/invoices/:invoiceId",
  ...portal,
  portalController.getInvoiceDetail,
);
router.get(
  "/api/businesses/:businessId/payments",
  ...portal,
  portalController.getPayments,
);

export default router;
