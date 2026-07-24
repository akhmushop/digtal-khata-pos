import type { Request, Response } from "express";
import * as expensesService from "./expenses.service.js";
import { handleError } from "../../utils/handleError.js";
interface CreateExpenseInput {
  title: string;
  expense_date: string;
  amount: number;
  category_id: number;
  payment_method: string;
  reference_no?: string;
  note?: string;
}
export async function createExpense(req: Request, res: Response) {
  try {
    const {
      title,
      expense_date,
      amount,
      category_id,
      payment_method,
      reference_no,
      note,
    } = req.body as CreateExpenseInput;
    const created = await expensesService.createExpense({
      title,
      expenseDate: expense_date,
      amount,
      categoryId: category_id,
      paymentMethod: payment_method,
      referenceNo: reference_no,
      note,
    });
    res.status(201).json(created);
  } catch (err) {
    handleError(res, err);
  }
}
export async function getExpenseCategories(req: Request, res: Response) {
  const categories = await expensesService.getExpenseCategories();
  res.json(categories);
}
