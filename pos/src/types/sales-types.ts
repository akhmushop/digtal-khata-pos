import type { CartType, CashForm } from "./cart-types.js";
export interface SalesStoreType {
  id: number;
  sale_items_id: number;
  saleId: number;
  productName: string;
  soldQuantity: number;
  cost: number;
  price: number;
  category: string;
  createdAt: string;
  soldPrice: number;
}
export interface SalesStore {
  soldProducts: SalesStoreType[];
  loading: boolean;
  error: null | string;
  getSoldProducts: () => void;
  addToSoldProduct: (cart: CartType[], cashForm: CashForm) => void;
  returnSingleItems: (item: SalesStoreType) => void;
  returnProducts: (id: number) => void;
}
export interface AllSoldProduct {
  id: number;
  items: SalesStoreType[];
  createdAt: string;
}
export interface DetailsProduct {}
