import { create } from "zustand";
export const useCustomerStore = create((set) => ({
  customers: [],
  addCustomer: (customerInfo) =>
    set((state) => ({
      customers: [...state.customers, customerInfo],
    })),
}));
