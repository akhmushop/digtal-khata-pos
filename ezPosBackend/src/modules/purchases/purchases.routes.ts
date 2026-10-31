import express from "express";
import * as purchasesController from "./purchases.controller.js";
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
  "/api/purchases",
  ...write,
  requirePermission("purchases.create"),
  purchasesController.createPurchase,
);
router.get(
  "/api/purchases",
  ...read,
  requirePermission("purchases.view"),
  purchasesController.getPurchasesSummary,
);
router.get(
  "/api/purchases/items",
  ...read,
  requirePermission("purchases.view"),
  purchasesController.getPurchasesItems,
);
router.post(
  "/api/purchases/receive",
  ...write,
  requirePermission("purchases.receive"),
  purchasesController.createReceivePurchase,
);
export default router;
