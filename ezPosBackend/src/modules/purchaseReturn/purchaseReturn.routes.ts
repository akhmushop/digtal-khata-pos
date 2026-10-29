import express from "express";
import * as purchaseReturnController from "./purchaseReturn.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  requireBusinessContext,
  requireFullAccess,
} from "../../middleware/business.js";

const router = express.Router();
const read = [requireAuth, requireBusinessContext()] as const;
const write = [...read, requireFullAccess] as const;

router.post(
  "/api/purchase-return",
  ...write,
  purchaseReturnController.createPurchaseReturn,
);
router.get(
  "/api/purchases/return-items",
  ...read,
  purchaseReturnController.getPurchaseReturnItems,
);
export default router;
