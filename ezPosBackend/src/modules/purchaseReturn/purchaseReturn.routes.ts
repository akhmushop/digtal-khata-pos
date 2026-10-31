import express from "express";
import * as purchaseReturnController from "./purchaseReturn.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  requireBusinessContext,
  requireFullAccess,
} from "../../middleware/business.js";
import { requireLocationAccess } from "../../middleware/location.js";
import { requirePermission } from "../../middleware/permissions.js";

const router = express.Router();
// Location-aware: the X-Location-Id header (or the business default) is
// validated against membership + assignment before any handler runs.
const read = [
  requireAuth,
  requireBusinessContext(),
  requireLocationAccess(),
] as const;
const write = [...read, requireFullAccess] as const;

router.post(
  "/api/purchase-return",
  ...write,
  requirePermission("purchases.return"),
  purchaseReturnController.createPurchaseReturn,
);
router.get(
  "/api/purchases/return-items",
  ...read,
  requirePermission("purchases.view"),
  purchaseReturnController.getPurchaseReturnItems,
);
export default router;
