import axios from "../api/axios.js";
import { InputValue } from "../types/customers.types.js";

export const getCustomersApi = async () => {
  const { data } = await axios.get("/customers");
  return data;
};
export const createCustomerApi = async (customerInfo: InputValue) => {
  const { data } = await axios.post("/customers", customerInfo);
  return data;
};
