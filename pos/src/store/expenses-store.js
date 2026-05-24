import { create } from "zustand";
import { Expense } from "../pages/Expense/Expense.jsx";
import axios from "../axios.js";
export const useExpenseStore = create((set) => ({
  expenses : [],
  addExpense: (expenseData) => {
    axios.post("/expenses ",expenseData)
    set((state) => ({
      expenses : [...state.expenses , expenseData],
    }));
  },
}));
