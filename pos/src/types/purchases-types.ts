import type { ProductsTypes } from "./products-types.js";
interface PurchasesStoreType {
  created_at: string;
  discount: number;
  due_amount: number;
  final_total: number;
  id: number;
  note: string;
  paid_amount: number;
  payment_status: string;
  status: string;
  subtotal: number;
  supplier_name: number;
}
export interface PurchaseCart extends ProductsTypes {
  purchaseQty: number;
}
export interface PurchasesItems extends ProductsTypes {
  purchase_id: number;
  receive_quantity: number;
  cost_price: number;
  product_id: number;
  returnPurchaseQty: number;
  purchasePrice: number;
  receiveQuantity: number;
  sellingPrice: number;
}
export interface PurchasesReturnItems extends ProductsTypes {
  purchase_item_id: number;
  return_quantity: number;
}
export interface ChangedItems {
  id: number;
  product_id: number;
  returnPurchaseQty: number;
}
export interface UpdateStockChangedItems {
  id: number;
  product_id: number;
  receiveQuantity: number;
  purchasePrice: number;
  sellingPrice: number;
  changedFields: boolean;
}
interface UpdateStockResponse {
  message: string;
}
export interface PurchasesStore {
  purchases: {
    orderedPurchase: PurchasesStoreType[];
    partiallyPaidPurchase: PurchasesStoreType[];
    completedPurchase: PurchasesStoreType[];
    purchases: PurchasesStoreType[];
  };
  purchasesItems: PurchasesItems[];
  purchasesReturnItems: PurchasesReturnItems[];
  loading: boolean;
  error: string | null;
  getPurchaseItems: () => void;
  getPurchases: () => void;
  getPurchasesReturnItems: () => void;
  updateStock: (
    paymentDetails: PaymentDetails,
    changedItems: UpdateStockChangedItems[],
  ) => Promise<UpdateStockResponse>;
  purchaseReturn: (
    orderId: number,
    changedItems: ChangedItems[],
  ) => Promise<void>;
}
export interface PurchaseNewProps {
  purchases: PurchasesStoreType[];
}

export interface Suppliers {
  name: string;
}
interface BaseCard {
  bg: string;
  circleBg: string;
  title: string;
}

interface TotalCard extends BaseCard {
  total: number;
}

interface StatusCard extends BaseCard {
  status: string;
}

export type PaymentsInfoCard = TotalCard | StatusCard;
export interface SummaryCardProps {
  card: PaymentsInfoCard;
  formatCurrency: (value: number) => string;
}
export interface PaymentDetails {
  orderId: number;
  payment_amount: number;
  payment_method: string;
  payment_notes: string;
}
