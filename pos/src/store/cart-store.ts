import axios from "../axios.js";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartStore } from "../types/cart-types.js";
// export const useCartStore = create(
//   persist(
//     (set) => ({
//       cart: [],
//       addToCart: (cartProduct) =>
//         set((state) => {
//           const exists = state.cart.find(
//             (p) => p.barcode === cartProduct.barcode
//           );
//           if (exists) {
//             return {
//               cart: state.cart.map((p) =>
//                 p.barcode === cartProduct.barcode
//                   ? { ...p, qty: (p.qty || 1) + 1 }
//                   : p
//               ),
//             };
//           }
//           return { cart: [...state.cart, { ...cartProduct, qty: 1 }] };
//         }),
//       addCartQty: (cartBarcode) => {
//         set((state) => {
//           return {
//             cart: state.cart.map((p) =>
//               p.barcode === cartBarcode ? { ...p, qty: p.qty + 1 } : p
//             ),
//           };
//         });
//       },
//       removeCartQty: (cartBarcode) => {
//         set((state) => {
//           return {
//             cart: state.cart
//               .map((p) =>
//                 p.barcode === cartBarcode ? { ...p, qty: p.qty - 1 } : p
//               )
//               .filter((p) => p.qty > 0),
//           };
//         });
//       },
//       removeCartItem: (cartBarcode) => {
//         set((state) => {
//           return {
//             cart: state.cart.filter((item) => item.barcode !== cartBarcode),
//           };
//         });
//       },
//       addCustomCartQty: (editQtyValue, cartBarcode) => {
//         set((state) => {
//           return {
//             cart: state.cart.map((p) =>
//               p.barcode === cartBarcode ? { ...p, qty: editQtyValue } : p
//             ),
//           };
//         });
//       },
//       resetCart: () => {
//         set(() => {
//           return {
//             cart: [],
//           };
//         });
//       },
//       addHoldItemsToCart: (holdItems) => {
//         set(() => {
//           return {
//             cart: holdItems,
//           };
//         });
//       },
//     }),
//     {
//       name: "cart-storage",
//     }
//   )
// );

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  addToCart: (cartProduct) =>
    set((state) => {
      const exists = state.cart.find((p) => p.id === cartProduct.id);
      if (exists) {
        return {
          cart: state.cart.map((p) =>
            p.id === cartProduct.id
              ? { ...p, soldQuantity: (p.soldQuantity || 1) + 1 }
              : p,
          ),
        };
      }
      return { cart: [...state.cart, { ...cartProduct, soldQuantity: 1 }] };
    }),
  removeCartItem: (id) =>
    set((state) => ({
      cart: state.cart.filter((p) => p.id !== id),
    })),
  addCartQuantity: (id) =>
    set((state) => ({
      cart: state.cart.map((p) => {
        if (p.id === id) {
          return {
            ...p,
            soldQuantity: p.soldQuantity + 1,
          };
        }
        return p;
      }),
    })),
  removeCartQuantity: (id) =>
    set((state) => {
      return {
        cart: state.cart
          .map((p) =>
            p.id === id ? { ...p, soldQuantity: p.soldQuantity - 1 } : p,
          )
          .filter((p) => p.soldQuantity > 0),
      };
    }),
  addCustomCartQuantity: (id, customCartQuantity) =>
    set((state) => ({
      cart: state.cart.map((p) =>
        p.id === id ? { ...p, soldQuantity: customCartQuantity } : p,
      ),
    })),
  resetCart: () =>
    set((state) => ({
      cart: [],
    })),
}));
