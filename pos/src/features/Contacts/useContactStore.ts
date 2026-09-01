import { create } from "zustand";
import { createSupplierApi } from "./contact.api";
import { ContactStoreType } from "./contact.type";

export const useContactStore = create<ContactStoreType>((set) => ({
  createSupplier: async (data) => {
    const response = await createSupplierApi(data);
    return response.data;
  },
}));
