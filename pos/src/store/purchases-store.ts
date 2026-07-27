import { create } from "zustand";
import axios from "../api/axios.js";
import type { PurchasesStore } from "../types/purchases-types.js";
export const usePurchasesStore = create<PurchasesStore>((set) => ({
  purchases: {
    orderedPurchase: [],
    partiallyPaidPurchase: [],
    completedPurchase: [],
    purchases: [],
  },
  purchasesItems: [],
  purchasesReturnItems: [],
  loading: false,
  error: null,
  getPurchaseItems: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/purchases/items");
      set({ purchasesItems: res.data, loading: false });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      set({ error: errorMessage, loading: false });
    }
  },
  getPurchases: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/purchases");
      set({ purchases: res.data, loading: false });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      set({ error: errorMessage, loading: false });
    }
  },
  getPurchasesReturnItems: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/purchases/return-items");
      set({ purchasesReturnItems: res.data, loading: false });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      set({ error: errorMessage, loading: false });
    }
  },
  updateStock: async (paymentDetails, changedItems) => {
    try {
      const res = await axios.post("/purchases/updates", {
        paymentDetails,
        changedItems,
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  },
  purchaseReturn: async (orderId, changedItems) => {
    try {
      const res = await axios.post("/purchase-return", {
        orderId,
        changedItems,
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  },
}));
