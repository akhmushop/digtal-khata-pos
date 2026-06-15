import { create } from "zustand";
import axios from "../axios";
export const usePurchasesStore = create((set) => ({
  purchases: [],
  loading: false,
  error: null,
  getPurchases: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/purchases");
      set({ purchases: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
}));
