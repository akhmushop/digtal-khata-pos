import type { ProductsTypes } from "./products-types.js";
interface CartType extends ProductsTypes {
  sold_quantity: number;
}
export interface CartStore {
  cart: CartType[];
  addToCart: (cartProduct: ProductsTypes) => void;
  removeCartItem: (id: number) => void;
  addCartQuantity: (id: number) => void;
  removeCartQuantity: (id: number) => void;
  addCustomCartQuantity: (id: number, customCartQuantity: number) => void;
}
