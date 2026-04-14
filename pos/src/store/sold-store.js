import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useSellStore = create(
  persist(
    (set) => ({
      soldProducts: [],
      addToSellProduct: (cartItems) =>
        set((state) => ({
          soldProducts: [
            ...state.soldProducts,
            {
              id: Date.now(),
              items: cartItems.map((item) => ({
                ...item ,
                soldAt: new Date().toISOString()
              })),
              transactionDate: new Date().toISOString(),
            },
          ],
        })),
    }),
    {
      name: "soldProducts-storage",
    },
  ),
);
