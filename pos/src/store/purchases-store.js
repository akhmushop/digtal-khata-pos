import { create } from "zustand";
import axios from "../axios";
export const usePurchasesStore = create((set) => ({
  purchases: [],
  purchasesItems: [],
  loading: false,
  error: null,
  getPurchaseItems: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/purchases/items");
      set({ purchasesItems: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  getPurchases: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/purchases");
      set({ purchases: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  updateStock: async (paymentDetails, changedItems) => {
    try {
      axios.post("/purchases/updates",  {paymentDetails, changedItems} );
    } catch (err) {
      console.error(err);
    }
  },
}));
