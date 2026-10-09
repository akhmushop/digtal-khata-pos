import type { CartType, CashForm } from "../features/pos/types/cart.types.js";
export interface SalesStoreType {
  id: number;
  saleItemsId: number;
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
  sales: SalesStoreType[];
  loading: boolean;
  error: null | string;
  getSales: () => void;
  createSale: (cart: CartType[], cashForm: CashForm) => void;
  returnSingleItems: (item: SalesStoreType) => void;
  returnProducts: (id: number) => void;
}
export interface AllSoldProduct {
  id: number;
  items: SalesStoreType[];
  createdAt: string;
}
export interface DetailsProduct {}
