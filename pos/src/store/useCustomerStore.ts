import axios from "../api/axios.js";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { InputValue, CustomerStore } from "../types/customers.types.js";
import { createCustomerApi, getCustomersApi } from "../api/customer.api.js";
const initialCustomerInfo: InputValue = {
  id: 0,
  name: "",
  phone: "",
  address: "",
};

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: [],
  customerInfo: initialCustomerInfo,
  customerInputValue: initialCustomerInfo,
  showCustomerInfo: initialCustomerInfo,
  loading: false,
  error: null,
  handleOnchange: (e) => {
    const { id, value } = e.target;
    set((state) => ({
      customerInfo: {
        ...state.customerInfo,
        [id]: id === "phone" ? value.replace(/\D/g, "").slice(0, 11) : value,
      },
    }));
  },
  handleInputChange: (e, setChecked) => {
    const { value } = e.target;
    set((state) => ({
      customerInputValue: {
        ...state.customerInputValue,
        name: value,
      },
    }));
    if (value === "") {
      setChecked(true);
    }
  },
  setShowCustomerInfo: (customer) => {
    set((state) => ({
      showCustomerInfo: customer,
    }));
  },
  resetCustomerInfo: () =>
    set({
      customerInfo: { ...initialCustomerInfo },
    }),
  resetShowCustomerInfo: () =>
    set({
      showCustomerInfo: { ...initialCustomerInfo },
      customerInputValue: { ...initialCustomerInfo },
    }),
  handleAddCustomer: async () => {
    const { customerInfo, resetCustomerInfo } = get();
    if (customerInfo.name === "" || customerInfo.phone === "") {
      window.alert("Please fill all required fields");
      return;
    }
    if (!window.confirm("do you want to add customer")) {
      return;
    }
    try {
      const newCustomer = await get().addCustomer(customerInfo);
      resetCustomerInfo();
      // setInputValue(newCustomer);
      console.log("111");
    } catch (err) {
      console.error("Failed to add customer in handleAddCustomer:", err);
    }
  },
  getCustomers: async () => {
    set({ loading: true });
    try {
      const customersData = await getCustomersApi();
      set({ customers: customersData, loading: false });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      set({ error: errorMessage, loading: false });
    }
  },
  addCustomer: async (customerInfo) => {
    try {
      set({ loading: true });

      const customer = await createCustomerApi(customerInfo);

      set((state) => ({
        customers: [...state.customers, customer],
        loading: false,
        error: null,
      }));

      return customer;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      set({
        error: errorMessage,
        loading: false,
      });
    }
  },
}));
