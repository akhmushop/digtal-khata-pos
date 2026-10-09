
import { CreateSalePayload } from "../schemas/cart.schema.js";
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
  createSale: (data:CreateSalePayload) => void;
  returnSingleItems: (item: SalesStoreType) => void;
  returnProducts: (id: number) => void;
}
export interface AllSoldProduct {
  id: number;
  items: SalesStoreType[];
  createdAt: string;
}
export interface DetailsProduct {}
