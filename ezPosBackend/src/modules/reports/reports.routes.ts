import express from "express";
import * as reportsController from "./reports.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import { requireBusinessContext } from "../../middleware/business.js";

const router = express.Router();

// Reports are read-only: authenticated + verified owner membership + tenant
// context. They remain available after trial expiry per the subscription
// policy. Every report query is scoped to req.membership.businessId.
const read = [requireAuth, requireBusinessContext()] as const;

// Sales Reports
router.get("/api/reports/sales/summary", ...read, reportsController.getSalesSummary);
router.get("/api/reports/sales/hourly", ...read, reportsController.getHourlySales);
router.get("/api/reports/sales/invoices", ...read, reportsController.getSalesByInvoice);
router.get("/api/reports/sales/products", ...read, reportsController.getProductSales);
router.get("/api/reports/sales/customers", ...read, reportsController.getCustomerSales);
router.get("/api/reports/sales/payments", ...read, reportsController.getPaymentMethods);
router.get("/api/reports/sales/refunds", ...read, reportsController.getSaleRefunds);

// Financial Reports
router.get("/api/reports/financial/profit", ...read, reportsController.getProfit);
router.get("/api/reports/financial/expenses", ...read, reportsController.getExpenses);
router.get(
  "/api/reports/financial/receivables",
  ...read,
  reportsController.getCustomerReceivables
);
router.get(
  "/api/reports/financial/tax",
  ...read,
  reportsController.getTaxReconciliation
);
router.get(
  "/api/reports/financial/register-close",
  ...read,
  reportsController.getRegisterClose
);

// Inventory Reports
router.get("/api/reports/inventory/stock", ...read, reportsController.getStock);
router.get(
  "/api/reports/inventory/movements",
  ...read,
  reportsController.getStockMovements
);
router.get("/api/reports/inventory/batches", ...read, reportsController.getBatchExpiry);
router.get(
  "/api/reports/inventory/shrinkage",
  ...read,
  reportsController.getInventoryShrinkage
);

// Purchase Reports
router.get(
  "/api/reports/purchases/summary",
  ...read,
  reportsController.getPurchaseSummary
);
router.get(
  "/api/reports/purchases/payables",
  ...read,
  reportsController.getSupplierPayables
);

export default router;
