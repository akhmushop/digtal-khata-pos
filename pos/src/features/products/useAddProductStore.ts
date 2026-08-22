
import { AddProductType } from "@/features/products/addProduct.types";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { create } from "zustand";
import { getAddProductsSelectOptionsApi, getAddProductVariantOptionsApi } from "./addProduct.api";

const useAddProductStore = create<AddProductType>((set) => ({
  addProductsSelectOptions: {
    brands: [],
    categories: [],
    suppliers: [],
    units: [],
  },
  addProductVariantOptions: [],
  loading: false,
  error: null,
  getAddProductsSelectOptions: async () => {
    set({ loading: true });
    try {
      const data = await getAddProductsSelectOptionsApi();
      set({ addProductsSelectOptions: data, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },
  getAddProductVariantOptions: async () => {
    set({ loading: true });
    try {
      const data = await getAddProductVariantOptionsApi();
      set({ addProductVariantOptions: data, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },
}));
export default useAddProductStore;
