import express from "express";
import * as integrationsController from "./integrations.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  requireBusinessAccess,
  requireFullAccess,
} from "../../middleware/business.js";
import { requireBusinessModePortal } from "../../middleware/storefront.js";

const router = express.Router();

// Portal integration management — owner workflows on an online-capable
// business, full access required.
const portal = [
  requireAuth,
  requireBusinessAccess(),
  requireFullAccess,
  requireBusinessModePortal("online_only", "omnichannel"),
] as const;

router.post(
  "/api/businesses/:businessId/integrations/woocommerce/connect",
  ...portal,
  integrationsController.connectStore,
);
router.get(
  "/api/businesses/:businessId/integrations",
  requireAuth,
  requireBusinessAccess(),
  integrationsController.listIntegrations,
);
router.post(
  "/api/businesses/:businessId/integrations/:integrationId/disconnect",
  ...portal,
  integrationsController.disconnectStore,
);
router.post(
  "/api/businesses/:businessId/integrations/:integrationId/sync-products",
  ...portal,
  integrationsController.syncProducts,
);
router.post(
  "/api/businesses/:businessId/integrations/:integrationId/sync-stock",
  ...portal,
  integrationsController.syncStock,
);
router.get(
  "/api/businesses/:businessId/integrations/:integrationId/logs",
  requireAuth,
  requireBusinessAccess(),
  integrationsController.getSyncLogs,
);

/**
 * WooCommerce webhook delivery. Public by design — authenticity comes from
 * the HMAC signature over the raw body; the URL token merely routes to the
 * integration. Raw body must be captured exactly as sent.
 */
router.post(
  "/api/integrations/woocommerce/webhook/:token",
  // Raw body is captured by the app-level json parser (verify callback).
  integrationsController.woocommerceWebhook,
);

export default router;
