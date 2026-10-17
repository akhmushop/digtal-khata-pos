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
export type CreatePurchaseResponse = {
  success: boolean;
  message: string;
  data: {
    sale: {
      id: number;
      invoiceNumber: string;
      subtotal: number | null;
      discount: number | null;
      vat: number | null;
      finalTotal: number | null;
      dueAmount: number | null;
      paymentStatus: "paid" | "partial" | "unpaid";
    };
    change: number;
    paidAmount: number;
    dueAmount: number;
  };
};
export interface SalesStore {
  sales: SalesStoreType[];
  loading: boolean;
  error: null | string;
  getSales: () => void;
  createSale: (data: CreateSalePayload) => Promise<CreatePurchaseResponse>;
  returnSingleItems: (item: SalesStoreType) => void;
  returnProducts: (id: number) => void;
}
export interface AllSoldProduct {
  id: number;
  items: SalesStoreType[];
  createdAt: string;
}
export interface DetailsProduct {}
