import express from "express";
import * as salesController from "./sales.controller.js";

const router = express.Router();
router.get("/api/sold_products", salesController.getSalesData);
router.post("/api/sold_products", salesController.createSale);
router.post(
  "/api/sold_products/refund/:id",
  salesController.createSingleRefund,
);
router.post(
  "/api/sold_products/refunds_all/:id",
  salesController.createMultipleRefunds,
);
router.get("/api/dashboard_summary", salesController.getDashboardSummary);
export default router;
