import { create } from "zustand";
import { createSupplierApi, getSuppliersApi } from "./contact.api";
import type { ContactStoreType } from "./contact.type";

export const useContactStore = create<ContactStoreType>((set) => ({
  suppliers: [],
  loading: false,
  error: null,
  getSuppliers: async () => {
    set({ loading: true, error: null });
    try {
      const suppliers = await getSuppliersApi();
      set({ suppliers, loading: false });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      set({ error: message, loading: false });
      throw error;
    }
  },
  createSupplier: async (data) => {
    const { data: result } = await createSupplierApi(data);
    const supplier = {
      id: result.data.supplierId,
      name: data.supplierName,
      phone: data.phone,
      email: data.email,
      address: data.address,
      status: data.status,
    };
    set((state) => ({
      suppliers: [...state.suppliers, supplier].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
      error: null,
    }));
    return result;
  },
}));
