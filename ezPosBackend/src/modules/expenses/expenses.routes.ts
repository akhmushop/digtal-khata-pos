import express from "express";
import * as expensesController from "./expenses.controller.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  requireBusinessContext,
  requireFullAccess,
} from "../../middleware/business.js";

const router = express.Router();
const read = [requireAuth, requireBusinessContext()] as const;
const write = [...read, requireFullAccess] as const;

router.post("/api/expenses", ...write, expensesController.createExpense);
router.get("/api/expenses", ...read, expensesController.getExpenses);
router.patch("/api/expenses/:id", ...write, expensesController.updateExpense);
router.delete("/api/expenses/:id", ...write, expensesController.deleteExpense);
router.post(
  "/api/expense_categories",
  ...write,
  expensesController.createExpenseCategory,
);
router.get(
  "/api/expense_categories",
  ...read,
  expensesController.getExpenseCategories,
);
export default router;
