import express from "express";
import * as customersController from "./customers.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  requireBusinessContext,
  requireFullAccess,
} from "../../middleware/business.js";

const router = express.Router();
const read = [requireAuth, requireBusinessContext()] as const;
const write = [...read, requireFullAccess] as const;

router.get("/api/customers", ...read, customersController.getCustomers);
router.post("/api/customers", ...write, customersController.createCustomer);
router.get(
  "/api/due_by_customers",
  ...read,
  customersController.getCustomerDueSummary,
);
export default router;
