import express from "express";
import * as customersController from "./customers.controller.js";
const router = express.Router();
router.get("/api/customers", customersController.getCustomers);
router.post("/api/customers", customersController.createCustomer);
router.get("/api/due_by_customers", customersController.getCustomerDueSummary);
export default router;
