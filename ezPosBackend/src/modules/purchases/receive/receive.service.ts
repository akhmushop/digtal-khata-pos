import { purchaseItems } from "../../../db/schema/purchaseItems.js";
import { eq } from "drizzle-orm/pg-core/expressions";
import type { DbTransaction } from "../purchase.types.js";
import { inventoryStock } from "../../../db/schema/inventoryStock.js";
import { sql } from "drizzle-orm";
import { inventoryMovements } from "../../../db/schema/inventoryMovements.js";
import { inventoryBatches } from "../../../db/schema/inventoryBatches.js";
import type { Items } from "./receive.types.js";
import { serialNumbers } from "../../../db/schema/serialNumbers.js";
import { NotFoundError } from "../../../utils/handleError.js";
import { purchases } from "../../../db/schema/purchases.js";
import { purchasePayments } from "../../../db/schema/purchasePayments.js";
import { productVariants } from "../../../db/schema/productVariants.js";

export async function updatePurchaseItems(
  tx: DbTransaction,
  purchaseItemId: number,
  newReceivedQuantity: number,
  unitCost: number,
) {
  await tx
    .update(purchaseItems)
    .set({
      receivedQuantity: newReceivedQuantity,
      unitCost,
    })
    .where(eq(purchaseItems.id, purchaseItemId));
}
export async function updateProductVariants(
  tx: DbTransaction,
  sellingPrice: number,
  variantId: number,
) {
  await tx
    .update(productVariants)
    .set({
      sellingPrice,
    })
    .where(eq(productVariants.id, variantId));
}
export async function insertInventoryStockOnConflictDoUpdate(
  tx: DbTransaction,
  variantId: number,
  receiveNow: number,
) {
  await tx
    .insert(inventoryStock)
    .values({
      variantId,
      quantity: receiveNow,
    })
    .onConflictDoUpdate({
      target: inventoryStock.variantId,
      set: {
        quantity: sql`
              ${inventoryStock.quantity}
              + ${receiveNow}
            `,
      },
    });
}
export async function insertInventoryMovements(
  tx: DbTransaction,
  variantId: number,
  purchaseId: number,
  receiveNow: number,
) {
  await tx.insert(inventoryMovements).values({
    variantId,
    movementType: "purchase",
    referenceType: "purchase",
    referenceId: purchaseId,
    quantity: receiveNow,
  });
}
export async function insertInventoryBatches(
  tx: DbTransaction,
  receiveItem: Items,
  variantId: number,
  purchaseItemId: number,
) {
  let rows;

  if (receiveItem.trackingType === "batch") {
    rows = (receiveItem.batches ?? []).map((batch) => ({
      variantId,
      purchaseItemId,
      batchNumber: batch.batchNumber,
      purchasePrice: receiveItem.unitCost,
      quantityReceived: batch.quantity,
      quantityRemaining: batch.quantity,
      manufacturedDate: batch.manufacturedDate,
      expiryDate: batch.expiryDate,
    }));
  } else {
    // serial or no tracking: one automatic batch for this receive
    const quantity =
      receiveItem.trackingType === "serial"
        ? (receiveItem.serialNumbers ?? []).length
        : receiveItem.receiveNow;

    rows =
      quantity > 0
        ? [
            {
              variantId,
              purchaseItemId,
              batchNumber: `AUTO-${purchaseItemId}-${Date.now()}`, // batchNumber is notNull
              purchasePrice: receiveItem.unitCost,
              quantityReceived: quantity,
              quantityRemaining: quantity,
            },
          ]
        : [];
  }

  if (rows.length === 0) return [];

  return tx
    .insert(inventoryBatches)
    .values(rows)
    .returning({ id: inventoryBatches.id });
}
export async function insertSerialNumbers(
  tx: DbTransaction,
  receiveItem: Items,
  variantId: number,
  purchaseItemId: number,
  batchId: number,
) {
  const serials = receiveItem.serialNumbers ?? [];

  const serialNumbersToInsert = serials.map((serialNumber) => ({
    variantId,
    purchaseItemId,
    serialNumber,
    batchId
  }));

  await tx.insert(serialNumbers).values(serialNumbersToInsert);
}
export async function getAllPurchaseItems(
  tx: DbTransaction,
  purchaseId: number,
) {
  return await tx
    .select({
      quantity: purchaseItems.quantity,
      receivedQuantity: purchaseItems.receivedQuantity,
      unitCost: purchaseItems.unitCost,
    })
    .from(purchaseItems)
    .where(eq(purchaseItems.purchaseId, purchaseId));
}
type AllPurchaseItems = {
  quantity: number;
  receivedQuantity: number;
  unitCost: number;
};
export function calculatePurchaseStatus(allPurchaseItems: AllPurchaseItems[]) {
  const allItemsFullyReceived =
    allPurchaseItems.length > 0 &&
    allPurchaseItems.every((item) => item.receivedQuantity >= item.quantity);

  return allItemsFullyReceived ? "received" : "partially_received";
}

export function calculatePayments(
  allPurchaseItems: AllPurchaseItems[],
  paidAmount: number,
  paymentAmount: number,
  totalAmount: number,
) {
  const receivedAmount = allPurchaseItems.reduce(
    (sum, item) => sum + Number(item.receivedQuantity) * Number(item.unitCost),
    0,
  );

  const currentPaidAmount = Number(paidAmount ?? 0);

  const newPaymentAmount = Number(paymentAmount ?? 0);

  if (newPaymentAmount < 0) {
    throw new NotFoundError("Payment amount cannot be negative.");
  }

  if (newPaymentAmount > receivedAmount) {
    throw new NotFoundError(
      "Payment cannot be greater than the received purchase value.",
    );
  }

  const updatedPaidAmount = currentPaidAmount + newPaymentAmount;

  const updatedDueAmount =
    Number(totalAmount ?? receivedAmount) - updatedPaidAmount;
  return {
    updatedPaidAmount,
    receivedAmount,
    updatedDueAmount,
    newPaymentAmount,
  };
}
export function calculatePaymentStatus(
  updatedPaidAmount: number,
  totalAmount: number,
  receivedAmount: number,
) {
  let paymentStatus: "unpaid" | "partial" | "paid";

  if (updatedPaidAmount <= 0) {
    paymentStatus = "unpaid";
  } else if (updatedPaidAmount < Number(totalAmount ?? receivedAmount)) {
    paymentStatus = "partial";
  } else {
    paymentStatus = "paid";
  }
  return paymentStatus;
}
export async function updatePurchase(
  tx: DbTransaction,
  newStatus: "received" | "partially_received",
  updatedPaidAmount: number,
  updatedDueAmount: number,
  paymentStatus: "paid" | "unpaid" | "partial",
  purchaseId: number,
) {
  await tx
    .update(purchases)
    .set({
      status: newStatus,

      paidAmount: updatedPaidAmount,
      dueAmount: updatedDueAmount,

      paymentStatus,

      updatedAt: new Date(),
    })
    .where(eq(purchases.id, purchaseId));
}
export async function insertPurchasePayments(
  tx: DbTransaction,
  purchaseId: number,
  paymentMethod: "cash" | "bank_transfer" | "cheque" | "card" | "other",
  newPaymentAmount: number,
  paymentNotes: string | undefined,
) {
  await tx.insert(purchasePayments).values({
    purchaseId,
    method: paymentMethod,
    amount: newPaymentAmount,
    notes: paymentNotes,
    paymentDate: new Date(),
  });
}
