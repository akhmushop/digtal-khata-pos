import axios from "../axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
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

export const useCartStore = create((set) => ({
  cart: [],
  loading: false,
  error: null,
  getCart: async () => {
    set({ loading: true });
    try {
      const res = await axios.get("/cart");
      set({ cart: res.data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  addToCart: async (cartProduct, cart) => {
    try {
      const exists = cart.find((p) => p.id === cartProduct.id);
      if (exists) {
        axios.put(`cart/${cartProduct.id}`, { quantity: exists.sold_quantity });
      } else {
        axios.post(`/cart`, cartProduct);
      }

      set((state) => {
        const exists = state.cart.find((p) => p.id === cartProduct.id);
        if (exists) {
          return {
            cart: state.cart.map((p) =>
              p.id === cartProduct.id
                ? { ...p, sold_quantity: (p.sold_quantity || 1) + 1 }
                : p,
            ),
          };
        }
        return { cart: [...state.cart, { ...cartProduct, sold_quantity: 1 }] };
      });
    } catch (err) {
      console.error(err);
    }
  },
  removeCartItem: async (id) => {
    try {
      axios.delete(`cart/${id}`);
      set((state) => ({
        cart: state.cart.filter((p) => p.id !== id),
      }));
    } catch (err) {
      console.error(err);
    }
  },
  addCartQuantity: async (id, sold_quantity) => {
    try {
      axios.put(`cart/add/${id}`, { sold_quantity: sold_quantity });
      set((state) => ({
        cart: state.cart.map((p) => {
          if (p.id === id) {
            return {
              ...p,
              sold_quantity: p.sold_quantity + 1,
            };
          }
          return p;
        }),
      }));
    } catch (err) {
      console.error(err);
    }
  },
  removeCartQuantity: async (id, sold_quantity) => {
    try {
      set((state) => {
        axios.put(`cart/remove/${id}`, { sold_quantity: sold_quantity });
        const findProduct = state.cart.find((p) => p.sold_quantity <= 1);
        if (findProduct) {
          axios.delete(`cart/remove_cart/${id}`);
        }
        return {
          cart: state.cart
            .map((p) =>
              p.id === id ? { ...p, sold_quantity: p.sold_quantity - 1 } : p,
            )
            .filter((p) => p.sold_quantity > 0),
        };
      });
    } catch (err) {
      console.error(err);
    }
  },
  addCustomCartQuantity: async (id, customCartQuantity) => {
    try {
      axios.put(`cart/custom/${id}`, { sold_quantity: customCartQuantity });
      set((state) => ({
        cart: state.cart.map((p) =>
          p.id === id ? { ...p, sold_quantity: customCartQuantity } : p,
        ),
      }));
    } catch (err) {
      console.error(err);
    }
  },
  resetCart: async (id) => {
    try {
      axios.delete(`cart/reset/${id}`);
      set((state) => ({
        cart: [],
      }));
    } catch (err) {
      console.error(err);
    }
  },
}));
