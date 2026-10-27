import { create } from "zustand";
import { getErrorMessage } from "../../../utils/getErrorMessage.js";
import {
  createFullReturnApi,
  createSaleApi,
  createSingleReturnApi,
  getSalesApi,
} from "../sales.api.js";
import { SalesStore } from "../types/sales.types.js";
import type { SaleRefundRequest } from "../types/sales.types.js";

export const useSalesStore = create<SalesStore>((set) => ({
  sales: [],
  loading: false,
  error: null,
  getSales: async () => {
    set({ loading: true, error: null });
    try {
      const data = await getSalesApi();
      set({ sales: data });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err) });
    } finally {
      set({ loading: false });
    }
  },
  createSale: async (data) => {
    const response = await createSaleApi(data);
    return response.data;
  },
  returnSingleItems: async (item, options: SaleRefundRequest) => {
    await createSingleReturnApi(item, options);
    set({ sales: await getSalesApi(), error: null });
  },
  returnProducts: async (id, options: SaleRefundRequest) => {
    await createFullReturnApi(id, options);
    set({ sales: await getSalesApi(), error: null });
  },
}));
