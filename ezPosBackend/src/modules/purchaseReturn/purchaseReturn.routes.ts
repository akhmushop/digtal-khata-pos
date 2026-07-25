import express from "express";
import * as purchaseReturnController from "./purchaseReturn.controller.js";
const router = express.Router();
router.post(
  "/api/purchase-return",
  purchaseReturnController.createPurchaseReturn,
);
router.get(
  "/api/purchases/return-items",
  purchaseReturnController.getPurchaseReturnItems,
);
export default router;
