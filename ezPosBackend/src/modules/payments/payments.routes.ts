import express from "express";
import * as paymentsController from "./payments.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireBusinessAccess } from "../../middleware/business.js";

const router = express.Router();

// Start a checkout session for a pending invoice. Reachable in read-only
// mode (paying is how a customer LEAVES read-only).
router.post(
  "/api/businesses/:businessId/payments/initiate",
  requireAuth,
  requireBusinessAccess(),
  paymentsController.startPayment,
);

// Post-redirect verification — validates val_id SERVER-side against the
// gateway; the browser redirect itself never activates anything.
router.post(
  "/api/businesses/:businessId/payments/:paymentId/verify",
  requireAuth,
  requireBusinessAccess(),
  paymentsController.verifyPayment,
);

// Customer reporting failure/cancel from the gateway redirect pages.
router.post(
  "/api/businesses/:businessId/payments/:paymentId/outcome",
  requireAuth,
  requireBusinessAccess(),
  paymentsController.reportPaymentOutcome,
);

// Gateway IPN (server-to-server, unauthenticated by design — every payload
// is verified with the gateway's validator before anything activates).
router.post("/api/payments/ipn", paymentsController.paymentIpn);

export default router;
