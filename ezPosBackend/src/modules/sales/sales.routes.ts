import express from "express";
import * as salesController from "./sales.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  requireBusinessContext,
  requireFullAccess,
} from "../../middleware/business.js";

const router = express.Router();
const read = [requireAuth, requireBusinessContext()] as const;
const write = [...read, requireFullAccess] as const;

router.get("/api/sold_products", ...read, salesController.getSalesData);
router.post("/api/sales", ...write, salesController.createSale);
router.get("/api/sales/:id/receipt", ...read, salesController.getSaleReceipt);
// Refund endpoints are POST (state-changing) — full access required.
router.post(
  "/api/sold_products/refund/:id",
  ...write,
  salesController.createSingleRefund,
);
router.post(
  "/api/sold_products/refunds_all/:id",
  ...write,
  salesController.createMultipleRefunds,
);
router.get("/api/dashboard_summary", ...read, salesController.getDashboardSummary);
router.get("/api/variants/:variantId/serials", ...read, salesController.getAvailableSerials);
router.patch(
  "/api/variants/:variantId/serials",
  ...write,
  salesController.updateAvailableSerial,
);
export default router;
