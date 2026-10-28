import express from "express";
import * as expensesController from "./expenses.controller.js";
const router = express.Router();
router.post("/api/expenses", expensesController.createExpense);
router.get("/api/expenses", expensesController.getExpenses);
router.patch("/api/expenses/:id", expensesController.updateExpense);
router.delete("/api/expenses/:id", expensesController.deleteExpense);
router.post(
  "/api/expense_categories",
  expensesController.createExpenseCategory,
);
router.get("/api/expense_categories", expensesController.getExpenseCategories);
export default router;
