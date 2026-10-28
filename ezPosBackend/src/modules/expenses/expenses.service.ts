import { expenseCategories } from "../../db/schema/expenseCategories.js";
import { expenses } from "../../db/schema/expenses.js";
import { db } from "../../db/schema/index.js";
import { asc, desc, eq } from "drizzle-orm";
import { ConflictError, NotFoundError } from "../../utils/handleError.js";
import type { ExpenseWriteInput } from "./expenses.schema.js";
type NewExpense = typeof expenses.$inferInsert;

function toExpenseValues(data: ExpenseWriteInput): NewExpense {
  return {
    title: data.title,
    expenseDate: data.expense_date,
    amount: data.amount,
    categoryId: data.category_id,
    paymentMethod: data.payment_method,
    referenceNo: data.reference_no ?? null,
    note: data.note ?? null,
  };
}

export async function createExpense(data: ExpenseWriteInput) {
  const [expense] = await db
    .insert(expenses)
    .values(toExpenseValues(data))
    .returning();
  return expense;
}

export async function updateExpense(id: number, data: ExpenseWriteInput) {
  const [expense] = await db
    .update(expenses)
    .set(toExpenseValues(data))
    .where(eq(expenses.id, id))
    .returning();
  if (!expense) {
    throw new NotFoundError("Expense not found");
  }
  return expense;
}

export async function deleteExpense(id: number) {
  const [deleted] = await db
    .delete(expenses)
    .where(eq(expenses.id, id))
    .returning({ id: expenses.id });
  if (!deleted) {
    throw new NotFoundError("Expense not found");
  }
  return deleted;
}

export async function getExpenseCategories() {
  return db
    .select()
    .from(expenseCategories)
    .orderBy(asc(expenseCategories.categoryName));
}

export async function createExpenseCategory(categoryName: string) {
  const [existing] = await db
    .select({ id: expenseCategories.id })
    .from(expenseCategories)
    .where(eq(expenseCategories.categoryName, categoryName));
  if (existing) {
    throw new ConflictError("An expense category with this name already exists");
  }
  const [category] = await db
    .insert(expenseCategories)
    .values({ categoryName })
    .returning({
      id: expenseCategories.id,
      categoryName: expenseCategories.categoryName,
    });
  return category;
}

export async function getExpenses() {
  return db
    .select({
      id: expenses.id,
      title: expenses.title,
      amount: expenses.amount,
      categoryId: expenses.categoryId,
      categoryName: expenseCategories.categoryName,
      paymentMethod: expenses.paymentMethod,
      referenceNo: expenses.referenceNo,
      note: expenses.note,
      expenseDate: expenses.expenseDate,
      createdAt: expenses.createdAt,
    })
    .from(expenses)
    .leftJoin(
      expenseCategories,
      eq(expenses.categoryId, expenseCategories.id),
    )
    .orderBy(desc(expenses.expenseDate), desc(expenses.createdAt));
}
