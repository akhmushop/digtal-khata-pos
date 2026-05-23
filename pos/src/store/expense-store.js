import { create } from "zustand";
import { Expense } from "../pages/Expense/Expense";
export const useExpenseStore = create((set) => ({
  expense: [],
  addExpense: (expenseData) => set((state) => ({
    expense: [...state.expense,expenseData]
  })),
}));
