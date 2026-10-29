import type { Request, Response } from "express";
import * as expensesService from "./expenses.service.js";
import { sendSafeError } from "../../utils/safeError.js";
import { getBusinessId } from "../../middleware/business.js";
import {
  expenseCategorySchema,
  expenseIdSchema,
  expenseWriteSchema,
} from "./expenses.schema.js";

export async function createExpense(req: Request, res: Response) {
  try {
    const parsed = expenseWriteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid expense data",
        errors: parsed.error.flatten(),
      });
    }
    const created = await expensesService.createExpense(
      getBusinessId(req),
      parsed.data,
    );
    res.status(201).json(created);
  } catch (err) {
    sendSafeError(res, err, "Unable to create the expense.");
  }
}

export async function updateExpense(req: Request, res: Response) {
  try {
    const id = expenseIdSchema.safeParse(req.params.id);
    const parsed = expenseWriteSchema.safeParse(req.body);
    if (!id.success || !parsed.success) {
      return res.status(400).json({
        message: "Invalid expense ID or expense data",
        errors: {
          id: id.success ? undefined : id.error.flatten(),
          expense: parsed.success ? undefined : parsed.error.flatten(),
        },
      });
    }
    const updated = await expensesService.updateExpense(
      getBusinessId(req),
      id.data,
      parsed.data,
    );
    return res.json(updated);
  } catch (err) {
    return sendSafeError(res, err, "Unable to update the expense.");
  }
}

export async function deleteExpense(req: Request, res: Response) {
  try {
    const id = expenseIdSchema.safeParse(req.params.id);
    if (!id.success) {
      return res.status(400).json({ message: "Invalid expense ID" });
    }
    const deleted = await expensesService.deleteExpense(getBusinessId(req), id.data);
    return res.json({ message: "Expense deleted successfully", data: deleted });
  } catch (err) {
    return sendSafeError(res, err, "Unable to delete the expense.");
  }
}

export async function createExpenseCategory(req: Request, res: Response) {
  try {
    const parsed = expenseCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid expense category",
        errors: parsed.error.flatten(),
      });
    }
    const category = await expensesService.createExpenseCategory(
      getBusinessId(req),
      parsed.data.categoryName,
    );
    return res.status(201).json(category);
  } catch (err) {
    return sendSafeError(res, err, "Unable to create the expense category.");
  }
}

export async function getExpenses(req: Request, res: Response) {
  try {
    const allExpenses = await expensesService.getExpenses(getBusinessId(req));
    res.json(allExpenses);
  } catch (err) {
    sendSafeError(res, err, "Unable to load expenses.");
  }
}

export async function getExpenseCategories(req: Request, res: Response) {
  try {
    const categories = await expensesService.getExpenseCategories(
      getBusinessId(req),
    );
    res.json(categories);
  } catch (err) {
    sendSafeError(res, err, "Unable to load expense categories.");
  }
}
