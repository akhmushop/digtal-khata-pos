import express from "express";
import * as salesController from "./sales.controller.js";

const router = express.Router();
router.get("/api/sold_products", salesController.getSalesData);
router.post("/api/sales", salesController.createSale);
router.post(
  "/api/sold_products/refund/:id",
  salesController.createSingleRefund,
);
router.post(
  "/api/sold_products/refunds_all/:id",
  salesController.createMultipleRefunds,
);
router.get("/api/dashboard_summary", salesController.getDashboardSummary);
router.get("/api/variants/:variantId/serials", salesController.getAvailableSerials);
router.patch(
  "/api/variants/:variantId/serials",
  salesController.updateAvailableSerial,
);
export default router;
