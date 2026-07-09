import type { CartType, CashForm } from "./cart-types.js";
export interface SalesStoreType {
  id: number;
  sale_items_id: number;
  sale_id: number;
  product_name: string;
  sold_quantity: number;
  cost: number;
  price: number;
  category: string;
  created_at: string;
  sold_price: number;
}
export interface SalesStore {
  soldProducts: SalesStoreType[];
  loading: boolean;
  error: null | string;
  addToSoldProduct: (cart: CartType[], cashForm: CashForm) => void;
  returnSingleItems: (item: SalesStoreType) => void;
  returnProducts: (id: number) => void;
}
export interface AllSoldProduct {
  id: number;
  items: SalesStoreType[];
  created_at: string;
}
export interface DetailsProduct {}
