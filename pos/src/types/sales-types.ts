import type { CartType, CashForm } from "./cart-types.js";
interface SalesStoreType extends CartType {
  sale_items_id: number;
  sale_id: number;
}
export interface SalesStore {
  soldProducts: SalesStoreType[];
  loading: boolean;
  error: null | string;
  addToSoldProduct: (cart: CartType[], cashForm: CashForm) => void;
  returnSingleItems: (item: SalesStoreType) => void;
  returnProducts: (id: number) => void;
}
