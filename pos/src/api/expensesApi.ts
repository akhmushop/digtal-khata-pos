import axios from "../api/axios.js";
import { Expenses } from "../store/expenses-store";

export const createExpenseApi = async (expenseData: Expenses) => {
  return axios.post("/expenses", expenseData);
};
