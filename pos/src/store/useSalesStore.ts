import axios from "../api/axios.js";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SalesStore } from "../types/sales.types.js";
import { getErrorMessage } from "../utils/getErrorMessage.js";
import {
  createFullReturnApi,
  createSalesApi,
  createSingleReturnApi,
  getSalesProductsApi,
} from "../api/sales.api.js";
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
      const data = await getSalesProductsApi();
      set({ soldProducts: data, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },
  addToSoldProduct: async (cart, cashForm) => {
    await createSalesApi(cart, cashForm);
  },
  returnSingleItems: async (item) => {
    await createSingleReturnApi(item);
    set((state) => ({
      soldProducts: state.soldProducts.filter((product) =>
        product.saleId === item.saleId ? product.id !== item.id : product,
      ),
    }));
  },
  returnProducts: async (id) => {
    try {
      await createFullReturnApi(id);
      set((state) => ({
        soldProducts: state.soldProducts.filter((p) => p.saleId !== id),
      }));
    } catch (err) {
      console.error(err);
    }
  },
}));
