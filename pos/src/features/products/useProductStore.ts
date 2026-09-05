import {
  ProductStoreType,
  VariantOptionData,
  VariantTypeData,
} from "@/features/products/product.types";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { create } from "zustand";
import {
  createBrandApi,
  createCategoryApi,
  createProductApi,
  createUnitApi,
  createVariantOptionApi,
  createVariantTypeApi,
  getProductsApi,
  getProductSelectOptionsApi,
  getProductVariantOptionsApi,
} from "./product.api";

const useProductStore = create<ProductStoreType>((set) => ({
  products: [],
  productSelectOptions: {
    brands: [],
    categories: [],
    suppliers: [],
    units: [],
  },
  productVariantOptions: [],
  loading: false,
  error: null,
  getProducts: async () => {
    set({ loading: true });
    try {
      const productsData = await getProductsApi();
      set({ products: productsData, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },
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
    const response = await createVariantTypeApi(data);
    const newType: VariantTypeData = response.data.data;
    const typeToAdd = {
      typeId: newType.id,
      typeName: newType.name,
      options: [],
    };
    set((state) => ({
      productVariantOptions: [...state.productVariantOptions, typeToAdd],
    }));
    return response.data;
  },
  createVariantOption: async (data) => {
    const response = await createVariantOptionApi(data);
    const newOptions = response.data.data;

    set((state) => ({
      ...state,
      productVariantOptions: state.productVariantOptions.map((group) => {
        const optionsToAdd = newOptions
          .filter(
            (opt: VariantOptionData) => opt.variantTypeId === group.typeId,
          )
          .map((opt: VariantOptionData) => ({
            optionId: opt.id,
            value: opt.value,
          }));
        if (optionsToAdd.length > 0) {
          return {
            ...group,
            options: [...group.options, ...optionsToAdd],
          };
        }
        return group;
      }),
    }));

    return response.data;
  },
}));
export default useProductStore;
