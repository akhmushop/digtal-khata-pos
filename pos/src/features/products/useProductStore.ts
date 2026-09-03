import { ProductStoreType } from "@/features/products/product.types";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { create } from "zustand";
import {
  createBrandApi,
  createCategoryApi,
  createProductApi,
  createUnitApi,
  createVariantOptionApi,
  createVariantTypeApi,
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
    console.log(data);
    const response = await createProductApi(data);
    return response.data;
  },
  createCategory: async (data) => {
    const response = await createCategoryApi(data);
    set((state) => ({
      productSelectOptions: {
        ...state.productSelectOptions,
        categories: [
          response.data.data,
          ...state.productSelectOptions.categories,
        ],
      },
    }));
    return response.data;
  },
  createBrand: async (data) => {
    const response = await createBrandApi(data);
    set((state) => ({
      productSelectOptions: {
        ...state.productSelectOptions,
        brands: [response.data.data, ...state.productSelectOptions.brands],
      },
    }));
    return response.data;
  },
  createUnit: async (data) => {
    const response = await createUnitApi(data);
    set((state) => ({
      productSelectOptions: {
        ...state.productSelectOptions,
        units: [response.data.data, ...state.productSelectOptions.units],
      },
    }));
    return response.data;
  },
  createVariantType: async (data) => {
    const response = await createVariantTypeApi(data)
    return response.data
  },
  createVariantOption: async (data) => {
    const response = await createVariantOptionApi(data)
    return response.data
  }
}));
export default useProductStore;
