import { ProductStoreType } from "@/features/products/product.types";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { create } from "zustand";
import {
  createProductApi,
  getProductSelectOptionsApi,
  getProductVariantOptionsApi,
} from "./product.api";

const useProductStore = create<ProductStoreType>((set) => ({
  productSelectOptions: {
    brands: [],
    categories: [],
    suppliers: [],
    units: [],
  },
  productVariantOptions: [],
  loading: false,
  error: null,
  getProductSelectOptions: async () => {
    set({ loading: true });
    try {
      const data = await getProductSelectOptionsApi();
      set({ productSelectOptions: data, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },
  getProductVariantOptions: async () => {
    set({ loading: true });
    try {
      const data = await getProductVariantOptionsApi();
      set({ productVariantOptions: data, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },
  createProduct: async (data) => {
    try {
      console.log(data);
      createProductApi(data);
    } catch (err) {
      console.error(err);
    }
  },
}));
export default useProductStore;
