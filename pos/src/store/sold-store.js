import axios from "../axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
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
export const useSoldStore = create((set) => ({
  soldProducts: [],
  loading: false,
  error: null,
  getSoldProducts: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/sold_products");
      set({ soldProducts: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  addToSoldProduct: async (cart) => {
    axios.post("/sold_products", cart);
  },
  returnSingleItems: async (id,sale_items_id) => {
    axios.post(`/sold_products/refund/${sale_items_id}`);
    set((state) => ({
      soldProducts: state.soldProducts.filter((product) => product.id !== id),
    }));
  },
}));
