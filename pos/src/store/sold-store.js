import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useSoldStore = create(
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
                ...item,
                soldAt: new Date().toISOString(),
              })),
              transactionDate: new Date().toISOString(),
            },
          ],
        })),
      returnProducts: (soldId) =>
        set((state) => ({
          soldProducts: state.soldProducts.filter(
            (product) => product.id !== soldId,
          ),
        })),
      returnSingleItems: (itemId, identifyArray) =>
        set((state) => ({
          soldProducts: state.soldProducts.map((product) => {
            if (product.id === identifyArray) {
              return {
                ...product,
                items: product.items.filter((p) => p.id !== itemId),
              };
            }
            return product;
          }),
        })),
      removeProduct: () =>
        set((state) => ({
          soldProducts: state.soldProducts.filter(
            (product) => product.items.length !== 0,
          ),
        })),
    }),
    {
      name: "soldProducts-storage",
    },
  ),
);
