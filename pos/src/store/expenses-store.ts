import { create } from "zustand";
import { Expense } from "../pages/Expense/Expense.js";
import axios from "../api/axios.js";
export interface Expenses {
  title: string;
  expenseDate: string;
  amount: number;
  categoryId: number;
  paymentMethod: string;
  referenceNo: number | string;
  note: string;
}
export interface ExpenseCategories {
  id: number;
  categoryName: string;
}
interface ExpenseStore {
  expenses: Expenses[];
  addExpense: (expenseData: Expenses) => void;
}
export const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses: [],
  addExpense: (expenseData) => {
    axios.post("/expenses ", expenseData);
    set((state) => ({
      expenses: [...state.expenses, expenseData],
    }));
  },
}));
