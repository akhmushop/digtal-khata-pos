import axios from "../axios.js";
import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useCustomerStore = create((set) => ({
  customers: [],
  loading: false,
  error: null,
  getCustomers: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/customers");
      set({ customers: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  addCustomer: async (customerInfo) => {
    try {
      set({ loading: true });

      const res = await axios.post("/customers", customerInfo);

      set((state) => ({
        customers: [...state.customers, res.data],
        loading: false,
        error: null,
      }));

      return res.data;
    } catch (err) {
      set({
        error: err.message,
        loading: false,
      });
    }
  },
}));
