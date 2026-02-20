import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useSellStore = create(
  persist(
    (set) => ({
      sellProduct: [],
      addToSellProduct: (cartItems) =>
        set((state) => ({
          sellProduct: [
            ...state.sellProduct,
            {
              id: Date.now(),
              items: cartItems,
              createdAt: new Date().toISOString(),
            },
          ],
        })),
    }),
    {
      name: "sellProduct-storage",
    },
  ),
);
