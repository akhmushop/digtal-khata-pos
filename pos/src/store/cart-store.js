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
      const res = await fetch("http://localhost:3000/api/cart");
      const data = await res.json();
      set({ cart: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  addToCart: async (cartProduct) => {
    try {
      const res = await fetch("http://localhost:3000/api/cart");
      const data = await res.json();
      const exists = data.find((p) => p.id === cartProduct.id);
      if (exists) {
        await fetch(`http://localhost:3000/api/cart/${cartProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: exists.sold_quantity }),
        });
      } else {
       await fetch(`http://localhost:3000/api/cart`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cartProduct),
        });
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
      console.err(err);
    }
  },
  removeCartItem: async (id) => {
    try {
      await fetch(`http://localhost:3000/api/cart/${id}`, {
        method: "DELETE"
      });
      set((state) => ({
        cart: state.cart.filter((p) => p.id !== id),
      }));
    } catch (err) {
      console.error(err);
    }
  },
}));
