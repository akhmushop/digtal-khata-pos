import express from "express";
import * as webhooksController from "./webhookEndpoints.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  requireBusinessAccess,
  requireFullAccess,
} from "../../middleware/business.js";

const router = express.Router();

// Portal webhook management — owner workflows, full access.
const portal = [
  requireAuth,
  requireBusinessAccess(),
  requireFullAccess,
] as const;

router.post(
  "/api/businesses/:businessId/webhooks",
  ...portal,
  webhooksController.createWebhookEndpoint,
);
router.get(
  "/api/businesses/:businessId/webhooks",
  ...portal,
  webhooksController.getWebhookEndpoints,
);
router.delete(
  "/api/businesses/:businessId/webhooks/:endpointId",
  ...portal,
  webhooksController.removeWebhookEndpoint,
);
router.get(
  "/api/businesses/:businessId/webhooks/:endpointId/deliveries",
  requireAuth,
  requireBusinessAccess(),
  webhooksController.getWebhookDeliveries,
);
router.post(
  "/api/businesses/:businessId/webhooks/:endpointId/test",
  ...portal,
  webhooksController.testWebhookEndpoint,
);

export default router;
