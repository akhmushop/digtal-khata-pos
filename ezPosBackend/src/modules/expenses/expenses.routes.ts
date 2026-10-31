import express from "express";
import * as expensesController from "./expenses.controller.js";
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
  "/api/expenses",
  ...write,
  requirePermission("expenses.create"),
  expensesController.createExpense,
);
router.get(
  "/api/expenses",
  ...read,
  requirePermission("expenses.view"),
  expensesController.getExpenses,
);
router.patch(
  "/api/expenses/:id",
  ...write,
  requirePermission("expenses.edit"),
  expensesController.updateExpense,
);
router.delete(
  "/api/expenses/:id",
  ...write,
  requirePermission("expenses.delete"),
  expensesController.deleteExpense,
);
router.post(
  "/api/expense_categories",
  ...write,
  requirePermission("expenses.create"),
  expensesController.createExpenseCategory,
);
router.get(
  "/api/expense_categories",
  ...read,
  requirePermission("expenses.view"),
  expensesController.getExpenseCategories,
);
export default router;
