import axios from "./axios.js";
import { Expenses } from "../store/useExpenseStore.js";

export const createExpenseApi = async (expenseData: Expenses) => {
  return axios.post("/expenses", expenseData);
};
