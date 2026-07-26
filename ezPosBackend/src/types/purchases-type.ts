import { pgEnum } from "drizzle-orm/pg-core";
import type { ChangedItems } from "./changedItems-types.js";
import type { suppliers } from "../db/schema/suppliers.js";

export const statusEnum = pgEnum("status", [
  "ordered",
  "received",
  "partially_received",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "received",
  "paid",
  "unpaid",
  "partial_paid",
]);

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
