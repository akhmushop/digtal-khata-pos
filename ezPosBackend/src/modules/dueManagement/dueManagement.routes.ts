import express from "express";
import * as dueManagementController from "./dueManagement.controller.js";

const router = express.Router();

router.get("/api/due-management/summary", dueManagementController.getDueManagementSummary);
router.get("/api/due-management/customers", dueManagementController.getCustomerDueRows);
router.get("/api/due-management/suppliers", dueManagementController.getSupplierDueRows);
router.post("/api/due-management/customer-payment", dueManagementController.recordCustomerPayment);
router.post("/api/due-management/supplier-payment", dueManagementController.recordSupplierPayment);
router.get("/api/due-management/customer-ledger/:customerId", dueManagementController.getCustomerLedger);
router.get("/api/due-management/supplier-ledger/:supplierId", dueManagementController.getSupplierLedger);

export default router;
