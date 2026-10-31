import express from "express";
import * as stockTransfersController from "./stockTransfers.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireBusinessContext, requireFullAccess } from "../../middleware/business.js";
import { requirePermission } from "../../middleware/permissions.js";

const router = express.Router();
const read = [
  requireAuth,
  requireBusinessContext(),
  requirePermission("inventory.transfer"),
] as const;
const write = [...read, requireFullAccess] as const;

// Location access is enforced per-transfer inside the service: the source
// location for shipping, the destination for receiving, both for drafts —
// transfers are inherently cross-location, so the single X-Location-Id
// chain does not apply here.
router.get("/api/stock-transfers", ...read, stockTransfersController.getTransfers);
router.get("/api/stock-transfers/:transferId", ...read, stockTransfersController.getTransfer);
router.post("/api/stock-transfers", ...write, stockTransfersController.postTransfer);
router.post("/api/stock-transfers/:transferId/ship", ...write, stockTransfersController.postTransferShip);
router.post("/api/stock-transfers/:transferId/receive", ...write, stockTransfersController.postTransferReceive);
router.post("/api/stock-transfers/:transferId/cancel", ...write, stockTransfersController.postTransferCancel);

export default router;
