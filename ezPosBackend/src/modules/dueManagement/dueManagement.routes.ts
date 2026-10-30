import express from "express";
import * as dueManagementController from "./dueManagement.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  requireBusinessContext,
  requireFullAccess,
} from "../../middleware/business.js";

const router = express.Router();
// Read chain: authenticated + verified owner membership + tenant context.
const read = [requireAuth, requireBusinessContext()] as const;
// State-changing chain additionally requires full subscription access.
const write = [...read, requireFullAccess] as const;

router.get("/api/due-management/summary", ...read, dueManagementController.getDueManagementSummary);
router.get("/api/due-management/trend", ...read, dueManagementController.getDueManagementTrend);
router.get("/api/due-management/customers", ...read, dueManagementController.getCustomerDueRows);
router.get("/api/due-management/customers/balances", ...read, dueManagementController.getCustomerDueBalances);
router.get("/api/due-management/suppliers", ...read, dueManagementController.getSupplierDueRows);
router.get("/api/due-management/sales/:saleId/payments", ...read, dueManagementController.getSalePaymentHistory);
router.get("/api/due-management/purchases/:purchaseId/payments", ...read, dueManagementController.getPurchasePaymentHistory);
router.post("/api/due-management/customer-payment", ...write, dueManagementController.recordCustomerPayment);
router.post("/api/due-management/supplier-payment", ...write, dueManagementController.recordSupplierPayment);
router.get("/api/due-management/customer-ledger/:customerId", ...read, dueManagementController.getCustomerLedger);
router.get("/api/due-management/supplier-ledger/:supplierId", ...read, dueManagementController.getSupplierLedger);

export default router;
