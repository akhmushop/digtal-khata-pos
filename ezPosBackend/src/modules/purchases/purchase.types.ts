import type { ChangedItems } from "../../types/changedItems-types.js";
import type { suppliers } from "../../db/schema/suppliers.js";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { ExtractTablesWithRelations } from "drizzle-orm/relations";
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
export type DbTransaction = PgTransaction<
  NodePgQueryResultHKT,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;
