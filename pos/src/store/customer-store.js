import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useCustomerStore = create(
  persist((set) => ({
    customers: [],
    addCustomer: (customerInfo) =>
      set((state) => ({
        customers: [...state.customers, customerInfo],
      })),
  })),
  {
    name: "customers",
  },
);
