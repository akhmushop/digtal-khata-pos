import express from "express";
import * as purchasesController from "./purchases.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  requireBusinessContext,
  requireFullAccess,
} from "../../middleware/business.js";

const router = express.Router();
const read = [requireAuth, requireBusinessContext()] as const;
const write = [...read, requireFullAccess] as const;

router.post("/api/purchases", ...write, purchasesController.createPurchase);
router.get(
  "/api/purchases",
  ...read,
  purchasesController.getPurchasesSummary,
);
router.get("/api/purchases/items", ...read, purchasesController.getPurchasesItems);
router.post(
  "/api/purchases/receive",
  ...write,
  purchasesController.createReceivePurchase,
);
export default router;
