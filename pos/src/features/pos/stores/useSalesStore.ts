import axios from "../../../api/axios.js";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getErrorMessage } from "../../../utils/getErrorMessage.js";
import {
  createFullReturnApi,
  createSaleApi,
  createSingleReturnApi,
  getSalesApi,
} from "../sales.api.js";
import { SalesStore } from "../types/sales.types.js";
// export const useSalesStore = create(
//   persist(
//     (set) => ({
//        sales: [],
//       addToSellProduct: (cartItems) =>
//         set((state) => ({
//            sales: [
//             ...state. sales,
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
//            sales: state. sales.filter(
//             (product) => product.id !== soldId,
//           ),
//         })),
//       returnSingleItems: (itemId, identifyArray) =>
//         set((state) => ({
//            sales: state. sales.map((product) => {
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
//            sales: state. sales.filter(
//             (product) => product.items.length !== 0,
//           ),
//         })),
//     }),
//     {
//       name: " sales-storage",
//     },
//   ),
// );
export const useSalesStore = create<SalesStore>((set) => ({
  sales: [],
  loading: false,
  error: null,
  getSales: async () => {
    set({ loading: true });
    try {
      const data = await getSalesApi();
      set({ sales: data, loading: false });
    } catch (err: unknown) {
      set({ error: getErrorMessage(err), loading: false });
    }
  },
  createSale: async (data) => {
    const response = await createSaleApi(data);
    return response.data;
  },
  returnSingleItems: async (item) => {
    await createSingleReturnApi(item);
    set((state) => ({
      sales: state.sales.filter((product) =>
        product.saleId === item.saleId ? product.id !== item.id : product,
      ),
    }));
  },
  returnProducts: async (id) => {
    try {
      await createFullReturnApi(id);
      set((state) => ({
        sales: state.sales.filter((p) => p.saleId !== id),
      }));
    } catch (err) {
      console.error(err);
    }
  },
}));
