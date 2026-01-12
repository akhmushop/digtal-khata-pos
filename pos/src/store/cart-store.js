import { create } from "zustand";
import { persist } from "zustand/middleware";
export const useCartStore = create(
  persist(
    (set) => ({
      cart: [],
      addToCart: (cartProduct) =>
        set((state) => {
          const exists = state.cart.find(
            (p) => p.barcode === cartProduct.barcode
          );
          if (exists) {
            return {
              cart: state.cart.map((p) =>
                p.barcode === cartProduct.barcode
                  ? { ...p, qty: (p.qty || 1) + 1 }
                  : p
              ),
            };
          }
          return { cart: [...state.cart, { ...cartProduct, qty: 1 }] };
        }),
      addCartQty: (cartBarcode) => {
        set((state) => {
          return {
            cart: state.cart.map((p) =>
              p.barcode === cartBarcode ? { ...p, qty: p.qty + 1 } : p
            ),
          };
        });
      },
      removeCartQty: (cartBarcode) => {
        set((state) => {
          return {
            cart: state.cart
              .map((p) =>
                p.barcode === cartBarcode ? { ...p, qty: p.qty - 1 } : p
              )
              .filter((p) => p.qty > 0),
          };
        });
      },
      removeCartItem: (cartBarcode) => {
        set((state) => {
          return {
            cart: state.cart.filter((item) => item.barcode !== cartBarcode),
          };
        });
      },
      addCustomCartQty: (editQtyValue, cartBarcode) => {
        set((state) => {
          return {
            cart: state.cart.map((p) =>
              p.barcode === cartBarcode ? { ...p, qty: editQtyValue } : p
            ),
          };
        });
      },
      resetCart: () => {
        set(() => {
          return {
            cart: [],
          };
        });
      },
      addHoldItemsToCart: (holdItems) => {
        set(() => {
          return {
            cart: holdItems,
          };
        });
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
