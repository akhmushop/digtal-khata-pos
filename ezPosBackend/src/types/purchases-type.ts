import type { ChangedItems } from "./changedItems-types.js";
import type { suppliers } from "../db/schema/suppliers.js";



export interface CreatePurchaseReturnInput {
  orderId: number;
  changedItems: ChangedItems[];
}
interface purchasesCart {
  id: number;
  purchaseQty: number;
  cost: number;
}
type supplier = typeof suppliers.$inferInsert;
export interface createPurchaseInput {
  purchasesCart: purchasesCart[];
  final_total: number;
  supplier: supplier;
  note: string;
}
interface paymentDetails {
  orderId: number;
  payment_amount: number;
  payment_method: string;
  payment_notes: string;
}
export interface purchasesUpdateInput {
  paymentDetails: paymentDetails;
  changedItems: ChangedItems[];
}
