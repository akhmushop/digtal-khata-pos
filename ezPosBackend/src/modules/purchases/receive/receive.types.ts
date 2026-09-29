export interface Items {
  itemId: number;
  trackingType: string;
  receiveNow: number;
  unitCost: number;
  sellingPrice: number;
  batches: {
    batchNumber: string;
    quantity: number;
    manufacturedDate: Date;
    expiryDate: Date;
  }[];
  serialNumbers: string[];
}
[];
export interface PurchaseItem {
  id: number;
  purchaseId: number;
  variantId: number;
  quantity: number;
  receivedQuantity: number;
  cancelledQuantity: number;
  unitCost: number;
  discount: number;
  tax: number;
  total: number;
}
