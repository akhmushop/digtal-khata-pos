import express from "express";
import * as dueManagementController from "./dueManagement.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  requireBusinessContext,
  requireFullAccess,
} from "../../middleware/business.js";
import { requirePermission, requireAnyPermission } from "../../middleware/permissions.js";

const router = express.Router();
// Read chain: authenticated + verified owner membership + tenant context.
const read = [requireAuth, requireBusinessContext()] as const;
// State-changing chain additionally requires full subscription access.
const write = [...read, requireFullAccess] as const;

router.get(
  "/api/due-management/summary",
  ...read,
  requireAnyPermission(['customers.view_ledger', 'suppliers.view_ledger']),
  dueManagementController.getDueManagementSummary,
);
router.get(
  "/api/due-management/trend",
  ...read,
  requireAnyPermission(['customers.view_ledger', 'suppliers.view_ledger']),
  dueManagementController.getDueManagementTrend,
);
router.get(
  "/api/due-management/customers",
  ...read,
  requirePermission("customers.view_ledger"),
  dueManagementController.getCustomerDueRows,
);
router.get(
  "/api/due-management/customers/balances",
  ...read,
  requirePermission("customers.view_ledger"),
  dueManagementController.getCustomerDueBalances,
);
router.get(
  "/api/due-management/suppliers",
  ...read,
  requirePermission("suppliers.view_ledger"),
  dueManagementController.getSupplierDueRows,
);
router.get(
  "/api/due-management/sales/:saleId/payments",
  ...read,
  requirePermission("customers.view_ledger"),
  dueManagementController.getSalePaymentHistory,
);
router.get(
  "/api/due-management/purchases/:purchaseId/payments",
  ...read,
  requirePermission("suppliers.view_ledger"),
  dueManagementController.getPurchasePaymentHistory,
);
router.post(
  "/api/due-management/customer-payment",
  ...write,
  requirePermission("customers.edit"),
  dueManagementController.recordCustomerPayment,
);
router.post(
  "/api/due-management/supplier-payment",
  ...write,
  requirePermission("suppliers.edit"),
  dueManagementController.recordSupplierPayment,
);
router.get(
  "/api/due-management/customer-ledger/:customerId",
  ...read,
  requirePermission("customers.view_ledger"),
  dueManagementController.getCustomerLedger,
);
router.get(
  "/api/due-management/supplier-ledger/:supplierId",
  ...read,
  requirePermission("suppliers.view_ledger"),
  dueManagementController.getSupplierLedger,
);

export default router;
