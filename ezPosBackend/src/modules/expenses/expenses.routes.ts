import express from "express";
import * as expensesController from "./expenses.controller.js";
const router = express.Router();
router.post("/api/expenses", expensesController.createExpense);
router.get("/api/expense_categories", expensesController.getExpenseCategories);
export default router;
