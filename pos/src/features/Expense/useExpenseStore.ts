import { create } from "zustand";
import {
  createExpenseCategoryApi,
  createExpenseApi,
  deleteExpenseApi,
  getExpenseCategoriesApi,
  getExpensesApi,
  updateExpenseApi,
} from "@/api/expenses.api";
import type {
  ExpenseCategory,
  ExpenseDraft,
  ExpenseRecord,
} from "./expense.type";

interface ExpenseStore {
  expenses: ExpenseRecord[];
  categories: ExpenseCategory[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  categoriesError: string | null;
  loadExpenses: () => Promise<void>;
  loadCategories: () => Promise<void>;
  createExpense: (expenseData: ExpenseDraft) => Promise<void>;
  updateExpense: (id: number, expenseData: ExpenseDraft) => Promise<void>;
  deleteExpense: (id: number) => Promise<void>;
  createCategory: (categoryName: string) => Promise<void>;
}

export const useExpenseStore = create<ExpenseStore>((set, get) => ({
  expenses: [],
  categories: [],
  loading: false,
  saving: false,
  error: null,
  categoriesError: null,
  loadExpenses: async () => {
    set({ loading: true, error: null });
    try {
      const expenses = await getExpensesApi();
      set({ expenses, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message, loading: false });
      throw error;
    }
  },
  loadCategories: async () => {
    set({ categoriesError: null });
    try {
      const categories = await getExpenseCategoriesApi();
      set({ categories });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      set({ categoriesError: message });
      throw error;
    }
  },
  createExpense: async (expenseData) => {
    set({ saving: true });
    try {
      const created = await createExpenseApi(expenseData);
      const categoryName =
        get().categories.find(
          (category) => category.id === created.categoryId,
        )?.categoryName ?? null;
      set((state) => ({
        expenses: [
          { ...created, categoryName },
          ...state.expenses,
        ].sort((a, b) => b.expenseDate.localeCompare(a.expenseDate)),
        saving: false,
        error: null,
      }));
    } catch (error: unknown) {
      set({ saving: false });
      throw error;
    }
  },
  updateExpense: async (id, expenseData) => {
    set({ saving: true });
    try {
      const updated = await updateExpenseApi(id, expenseData);
      const categoryName =
        get().categories.find(
          (category) => category.id === updated.categoryId,
        )?.categoryName ?? null;
      set((state) => ({
        expenses: state.expenses
          .map((expense) =>
            expense.id === id ? { ...updated, categoryName } : expense,
          )
          .sort((a, b) => b.expenseDate.localeCompare(a.expenseDate)),
        saving: false,
        error: null,
      }));
    } catch (error: unknown) {
      set({ saving: false });
      throw error;
    }
  },
  deleteExpense: async (id) => {
    await deleteExpenseApi(id);
    set((state) => ({
      expenses: state.expenses.filter((expense) => expense.id !== id),
      error: null,
    }));
  },
  createCategory: async (categoryName) => {
    const category = await createExpenseCategoryApi(categoryName);
    set((state) => ({
      categories: [...state.categories, category].sort((a, b) =>
        a.categoryName.localeCompare(b.categoryName),
      ),
      categoriesError: null,
    }));
  },
}));
