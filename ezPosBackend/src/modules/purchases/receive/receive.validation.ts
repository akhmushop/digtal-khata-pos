import { and, eq, inArray, type ExtractTablesWithRelations } from "drizzle-orm";
import { purchases } from "../../../db/schema/purchases.js";
import { NotFoundError } from "../../../utils/handleError.js";
import type { Items, PurchaseItem } from "./receive.types.js";
import type { PgTransaction } from "drizzle-orm/pg-core/session";
import type { NodePgQueryResultHKT } from "drizzle-orm/node-postgres/session";
import { purchaseItems } from "../../../db/schema/purchaseItems.js";

// BASIC REQUEST VALIDATION
export function basicRequestValidation(items: Items[]) {
  if (items.length === 0) {
    throw new NotFoundError("At least one purchase item is required.");
  }

  // Prevent duplicate item IDs in the request
  const itemIds = items.map((item) => item.itemId);
  const uniqueItemIds = new Set(itemIds);

  if (uniqueItemIds.size !== itemIds.length) {
    throw new NotFoundError("Duplicate purchase item IDs are not allowed.");
  }
  return itemIds;
}
//purchase Validation
export async function purchaseValidation(
  tx: PgTransaction<
    NodePgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >,
  purchaseId: number,
) {
  const [purchase] = await tx
    .select()
    .from(purchases)
    .where(eq(purchases.id, purchaseId))
    .for("update");

  if (!purchase) {
    throw new NotFoundError("Purchase order not found.");
  }

  if (purchase.status === "received") {
    throw new NotFoundError(
      "This purchase has already been completely received.",
    );
  }
  return purchase;
}
//purchase items validation
export async function purchaseItemsValidation(
  tx: PgTransaction<
    NodePgQueryResultHKT,
    Record<string, never>,
    ExtractTablesWithRelations<Record<string, never>>
  >,
  purchaseId: number,
  itemIds: number[],
) {
  const existingItems = await tx
    .select()
    .from(purchaseItems)
    .where(
      and(
        eq(purchaseItems.purchaseId, purchaseId),
        inArray(purchaseItems.id, itemIds),
      ),
    )
    .for("update");

  if (existingItems.length !== itemIds.length) {
    const foundIds = new Set(existingItems.map((item) => item.id));

    const missingIds = itemIds.filter((id) => !foundIds.has(id));

    throw new NotFoundError(
      `These purchase items do not belong to this purchase: ${missingIds.join(
        ", ",
      )}`,
    );
  }
  return existingItems;
}
//receiveItemsValidation
export async function receiveItemsValidation(
  purchaseItem: PurchaseItem,
  receiveItem: Items,
) {
  // -------------------------------------------------------
  // Receive quantity
  // -------------------------------------------------------

  if (receiveItem.receiveNow <= 0) {
    return; // Skip items with zero or negative receiveNow
  }

  const remainingQuantity =
    purchaseItem.quantity - purchaseItem.receivedQuantity;

  // Strict receiving:
  // Do not allow receiving more than ordered.
  if (receiveItem.receiveNow > remainingQuantity) {
    throw new NotFoundError(
      `Cannot receive ${receiveItem.receiveNow} for item ${purchaseItem.id}. ` +
        `Only ${remainingQuantity} remaining.`,
    );
  }
}
//batchValidation
export function batchValidation(
  purchaseItem: PurchaseItem,
  receiveItem: Items,
) {
  const batches = receiveItem.batches ?? [];
  if (batches.length === 0) {
    throw new NotFoundError(
      `Batch information is required for item ${purchaseItem.id}.`,
    );
  }

  const batchQuantity = batches.reduce((sum, batch) => sum + batch.quantity, 0);

  if (batchQuantity !== receiveItem.receiveNow) {
    throw new NotFoundError(
      `Batch quantity (${batchQuantity}) must equal ` +
        `receive quantity (${receiveItem.receiveNow}) ` +
        `for item ${purchaseItem.id}.`,
    );
  }

  // Validate individual batch quantities
  for (const batch of batches) {
    if (batch.quantity <= 0) {
      throw new NotFoundError(`Batch quantity must be greater than zero.`);
    }

    if (!batch.batchNumber.trim()) {
      throw new NotFoundError(`Batch number is required.`);
    }
  }
}
//serialNumberValidation
export function serialNumberValidation(
  purchaseItem: PurchaseItem,
  receiveItem: Items,
) {
  const serials = receiveItem.serialNumbers ?? [];

  if (serials.length !== receiveItem.receiveNow) {
    throw new NotFoundError(
      `Item ${purchaseItem.id} requires ${receiveItem.receiveNow} ` +
        `serial numbers, but ${serials.length} were provided.`,
    );
  }

  const uniqueSerials = new Set(serials);

  if (uniqueSerials.size !== serials.length) {
    throw new NotFoundError(`Duplicate serial numbers are not allowed.`);
  }

  for (const serial of serials) {
    if (!serial.trim()) {
      throw new NotFoundError(`Serial number cannot be empty.`);
    }
  }
}
