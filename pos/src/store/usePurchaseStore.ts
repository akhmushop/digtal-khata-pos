import { create } from "zustand";
import axios from "../api/axios.js";
import type { PurchasesStore } from "../features/purchases/purchase.types.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import {
  getPurchasesApi,
  getPurchasesItemsApi,
  getPurchasesReturnItemsApi,
  purchaseReturnApi,
  updateStockApi,
} from "../api/purchases.api.js";
export const usePurchasesStore = create<PurchasesStore>((set) => ({
  purchases: {
    orderedPurchase: [],
    partiallyPaidPurchase: [],
    completedPurchase: [],
    allPurchases: [],
  },
  purchasesItems: [],
  purchasesReturnItems: [],
  loading: false,
  error: null,
  getPurchaseItems: async () => {
    set({ loading: true });
    try {
      const data = await getPurchasesItemsApi();
      set({ purchasesItems: data, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },
  getPurchases: async () => {
    set({ loading: true });
    try {
      const data = await getPurchasesApi();
      set({ purchases: data, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },
  getPurchasesReturnItems: async () => {
    set({ loading: true });
    try {
      const data = await getPurchasesReturnItemsApi();
      set({ purchasesReturnItems: data, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },
  updateStock: async (paymentDetails, changedItems) => {
    try {
      const { data } = await updateStockApi(paymentDetails, changedItems);
      return data;
    } catch (err) {
      throw err;
    }
  },
  purchaseReturn: async (orderId, changedItems) => {
    try {
      const data = await purchaseReturnApi(orderId, changedItems);
      return data;
    } catch (err) {
      throw err;
    }
  },
}));
