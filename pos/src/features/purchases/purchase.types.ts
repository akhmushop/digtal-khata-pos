import { ProductType, ProductVariantType } from "../products/product.schema";
import { ReceiveItemsFormValues } from "./schemas/receiveItem.schema";

interface PurchaseStoreType {
  id: number;
  supplierId: number | null;
  purchaseOrderNumber: string;
  purchaseDate: Date;
  subtotal: number;
  discount: string;
  tax: string;
  shippingCost: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  status: "ordered" | "received" | "partially_received";
  paymentStatus: "received" | "paid" | "unpaid" | "partial_paid";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  supplierName: string | null;
}
export interface PurchaseCart extends ProductType {
  purchaseQty: number;
}
export interface PurchasesItems {
  productName: string;
  productUnit: string | null;
  sellingPrice: number;
  id: number;
  purchaseId: number;
  variantId: number;
  quantity: number;
  receivedQuantity: number;
  unitCost: number;
  discount: number;
  tax: number;
  total: number;
  productId: number;
  receiveNow: number;
  trackingType: string;
}
export interface PurchasesReturnItems extends ProductType {
  purchaseItemId: number;
  return_quantity: number;
}
export interface ChangedItems {
  id: number;
  productId: number;
  returnPurchaseQty: number;
}
export interface UpdateStockChangedItems {
  id: number;
  productId: number;
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
    orderedPurchase: PurchaseStoreType[];
    partiallyPaidPurchase: PurchaseStoreType[];
    completedPurchase: PurchaseStoreType[];
    allPurchases: PurchaseStoreType[];
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
  createReceivePurchase: (data: ReceivePurchasePayload) => Promise<void>;
}
export interface PurchaseNewProps {
  purchases: PurchaseStoreType[];
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
  paymentMethod: string;
  payment_notes: string;
}
export interface ProductCardProps {
  product: ProductType;
  handleAddPurchase: (product: ProductType) => void;
  defaultVariant: ProductVariantType;
}
export interface ShowVariantsProps extends ProductCardProps {}
export interface GroupedVariantOption {
  typeName: string;
  optionsName: string[];
}
export type CreatePurchaseItem = {
  variantId: number | undefined;
  quantity: number;
  purchasePrice: number;
};

export type CreatePurchaseInput = {
  items: CreatePurchaseItem[];
  supplierId: number | null | undefined;
  purchaseDate: string | undefined;
  notes: string;
};
export interface ReceivePurchasePayload {
  purchaseId: number;
  items: {
    itemId: number;
    trackingType: string;
    receiveNow: number;
    unitCost: number;
    sellingPrice: number;
    batches: { batchNumber: string; quantity: number; manufacturedDate: Date; expiryDate: Date; }[];
    serialNumbers: string[];
  }[];
  payment_amount: number;
  paymentMethod: string;
  payment_notes?: string;
}