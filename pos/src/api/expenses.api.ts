import axios from "./axios.js";
import type {
  ExpenseCategory,
  ExpenseDraft,
  ExpenseRecord,
} from "@/features/Expense/expense.type";

interface ExpenseApiRecord extends Omit<ExpenseRecord, "categoryName"> {
  categoryName?: string | null;
}

export async function getExpensesApi() {
  const { data } = await axios.get<ExpenseRecord[]>("/expenses");
  return data;
}

export async function getExpenseCategoriesApi() {
  const { data } = await axios.get<ExpenseCategory[]>("/expense_categories");
  return data;
}

export async function createExpenseApi(expenseData: ExpenseDraft) {
  const { data } = await axios.post<ExpenseApiRecord>("/expenses", {
    title: expenseData.title,
    expense_date: expenseData.expenseDate,
    amount: expenseData.amount,
    category_id: expenseData.categoryId,
    payment_method: expenseData.paymentMethod,
    reference_no: expenseData.referenceNo || null,
    note: expenseData.note || null,
  });
  return data;
}

export async function updateExpenseApi(id: number, expenseData: ExpenseDraft) {
  const { data } = await axios.patch<ExpenseApiRecord>(`/expenses/${id}`, {
    title: expenseData.title,
    expense_date: expenseData.expenseDate,
    amount: expenseData.amount,
    category_id: expenseData.categoryId,
    payment_method: expenseData.paymentMethod,
    reference_no: expenseData.referenceNo || null,
    note: expenseData.note || null,
  });
  return data;
}

export async function deleteExpenseApi(id: number) {
  return axios.delete(`/expenses/${id}`);
}

export async function createExpenseCategoryApi(categoryName: string) {
  const { data } = await axios.post<ExpenseCategory>("/expense_categories", {
    categoryName,
  });
  return data;
}
