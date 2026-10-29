import express from "express";
import * as reportsController from "./reports.controller.js";

const router = express.Router();

// Sales Reports
router.get("/api/reports/sales/summary", reportsController.getSalesSummary);
router.get("/api/reports/sales/invoices", reportsController.getSalesByInvoice);
router.get("/api/reports/sales/products", reportsController.getProductSales);
router.get("/api/reports/sales/customers", reportsController.getCustomerSales);
router.get("/api/reports/sales/payments", reportsController.getPaymentMethods);
router.get("/api/reports/sales/refunds", reportsController.getSaleRefunds);

// Financial Reports
router.get("/api/reports/financial/profit", reportsController.getProfit);
router.get("/api/reports/financial/expenses", reportsController.getExpenses);
router.get(
  "/api/reports/financial/receivables",
  reportsController.getCustomerReceivables
);

// Inventory Reports
router.get("/api/reports/inventory/stock", reportsController.getStock);
router.get(
  "/api/reports/inventory/movements",
  reportsController.getStockMovements
);
router.get("/api/reports/inventory/batches", reportsController.getBatchExpiry);

// Purchase Reports
router.get(
  "/api/reports/purchases/summary",
  reportsController.getPurchaseSummary
);
router.get(
  "/api/reports/purchases/payables",
  reportsController.getSupplierPayables
);

export default router;

