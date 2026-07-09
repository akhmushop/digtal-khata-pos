import { create } from "zustand";
import { Expense } from "../pages/Expense/Expense.js";
import axios from "../axios.js";
export interface Expenses {
    title: string,
    expense_date: string
    amount: number,
    category_id: number,
    payment_method: string,
    reference_no: number | string,
    note: string,
}
export interface ExpenseCategories {
  id:number
  category_name:string

}
interface ExpenseStore {
  expenses:Expenses[]
  addExpense:(expenseData:Expenses) => void
}
export const useExpenseStore = create<ExpenseStore>((set) => ({
  expenses : [],
  addExpense: (expenseData) => {
    axios.post("/expenses ",expenseData)
    set((state) => ({
      expenses : [...state.expenses , expenseData],
    }));
  },
}));
