import axios from "../axios.js";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SalesStore } from "../types/sales-types.js";
// export const useSoldStore = create(
//   persist(
//     (set) => ({
//       soldProducts: [],
//       addToSellProduct: (cartItems) =>
//         set((state) => ({
//           soldProducts: [
//             ...state.soldProducts,
//             {
//               id: Date.now(),
//               items: cartItems.map((item) => ({
//                 ...item,
//                 soldAt: new Date().toISOString(),
//               })),
//               transactionDate: new Date().toISOString(),
//             },
//           ],
//         })),
//       returnProducts: (soldId) =>
//         set((state) => ({
//           soldProducts: state.soldProducts.filter(
//             (product) => product.id !== soldId,
//           ),
//         })),
//       returnSingleItems: (itemId, identifyArray) =>
//         set((state) => ({
//           soldProducts: state.soldProducts.map((product) => {
//             if (product.id === identifyArray) {
//               return {
//                 ...product,
//                 items: product.items.filter((p) => p.id !== itemId),
//               };
//             }
//             return product;
//           }),
//         })),
//       removeProduct: () =>
//         set((state) => ({
//           soldProducts: state.soldProducts.filter(
//             (product) => product.items.length !== 0,
//           ),
//         })),
//     }),
//     {
//       name: "soldProducts-storage",
//     },
//   ),
// );
export const useSoldStore = create<SalesStore>((set) => ({
  soldProducts: [],
  loading: false,
  error: null,
  getSoldProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/sold_products");
      set({ soldProducts: res.data, loading: false });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      set({ error: errorMessage, loading: false });
    }
  },
  addToSoldProduct: async (cart, cashForm) => {
    axios.post("/sold_products", { cart: cart, cashForm: cashForm });
  },
  returnSingleItems: async (item) => {
    axios.post(`/sold_products/refund/${item.sale_items_id}`);
    set((state) => ({
      soldProducts: state.soldProducts.filter((product) =>
        product.saleId === item.saleId ? product.id !== item.id : product,
      ),
    }));
  },
  returnProducts: async (id) => {
    try {
      axios.post(`/sold_products/refunds_all/${id}`);
      set((state) => ({
        soldProducts: state.soldProducts.filter((p) => p.saleId !== id),
      }));
    } catch (err) {
      console.error(err);
    }
  },
}));
