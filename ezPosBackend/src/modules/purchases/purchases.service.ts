import { error } from "node:console";
import { db } from "../../db/schema/index.js";
import { purchaseItems } from "../../db/schema/purchaseItems.js";
import { purchases } from "../../db/schema/purchases.js";
import type { purchasesUpdateInput } from "./purchase.types.js";
import { and, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import { products } from "../../db/schema/products.js";
import type { ChangedItems } from "../../types/changedItems-types.js";
import { NotFoundError } from "../../utils/handleError.js";
import type { CreatePurchaseInput } from "./schemas/purchase.schema.js";
import { suppliers } from "../../db/schema/suppliers.js";
import { productVariants } from "../../db/schema/productVariants.js";
import { units } from "../../db/schema/units.js";
import type { ReceiveItemsFormValues } from "./schemas/receiveItem.schema.js";
import { inventoryStock } from "../../db/schema/inventoryStock.js";
import { inventoryMovements } from "../../db/schema/inventoryMovements.js";
import { inventoryBatches } from "../../db/schema/inventoryBatches.js";
import { serialNumbers } from "../../db/schema/serialNumbers.js";
import { purchasePayments } from "../../db/schema/purchasePayments.js";
import {
  basicRequestValidation,
  batchValidation,
  purchaseItemsValidation,
  purchaseValidation,
  receiveItemsValidation,
  serialNumberValidation,
} from "./receive/receive.validation.js";
import {
  calculatePayments,
  calculatePaymentStatus,
  calculatePurchaseStatus,
  getAllPurchaseItems,
  insertInventoryBatches,
  insertInventoryMovements,
  insertInventoryStockOnConflictDoUpdate,
  insertPurchasePayments,
  insertSerialNumbers,
  updatePurchase,
  updatePurchaseItems,
} from "./receive/receive.service.js";

export async function createPurchase(data: CreatePurchaseInput) {
  return db.transaction(async (tx) => {
    const { supplierId, items, purchaseDate, notes } = data;

    // 1. Validate Supplier
    if (supplierId) {
      const supplier = await tx
        .select({ id: suppliers.id })
        .from(suppliers)
        .where(eq(suppliers.id, supplierId));
      if (supplier.length === 0) {
        throw new NotFoundError("Supplier not found");
      }
    }

    // 2. Validate Variants
    const variantIds = [...new Set(items.map((item) => item.variantId))];
    const existingVariants = await tx
      .select({ id: productVariants.id, status: productVariants.status })
      .from(productVariants)
      .where(inArray(productVariants.id, variantIds));

    if (existingVariants.length !== variantIds.length) {
      const foundIds = existingVariants.map((v) => v.id);
      const missingIds = variantIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundError(
        `These variant IDs do not exist: ${missingIds.join(", ")}`,
      );
    }

    // Check for inactive variants
    for (const variant of existingVariants) {
      if (variant.status !== "active") {
        throw new NotFoundError(`Variant ${variant.id} is inactive`);
      }
    }

    // 3. Calculate totals
    const subtotal = items.reduce(
      (sum, item) => sum + item.purchasePrice * item.quantity,
      0,
    );

    // 4. Create Purchase
    const [newPurchase] = await tx
      .insert(purchases)
      .values({
        supplierId,
        purchaseDate,
        notes,
        subtotal,
      })
      .returning();

    if (!newPurchase) {
      throw new Error("Failed to create purchase record");
    }

    // 5. Create Purchase Items (BULK INSERT)
    const itemsToInsert = items.map((item) => ({
      purchaseId: newPurchase.id,
      variantId: item.variantId,
      quantity: item.quantity,
      receivedQuantity: 0,
      unitCost: item.purchasePrice,
    }));

    // Insert them all in ONE single database query!
    await tx.insert(purchaseItems).values(itemsToInsert);

    // 6. Return the new purchase so the frontend can use it
    return { purchaseOrderNumber: newPurchase.purchaseOrderNumber };
  });
}
export async function getPurchasesSummary() {
  const [
    orderedPurchase,
    allPurchases,
    partiallyPaidPurchase,
    completedPurchase,
  ] = await Promise.all([
    db
      .select({ ...getTableColumns(purchases), supplierName: suppliers.name })
      .from(purchases)
      .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
      .where(eq(purchases.status, "ordered")),
    db.select().from(purchases),
    db
      .select()
      .from(purchases)
      .where(inArray(purchases.paymentStatus, ["partial_paid", "unpaid"])),
    db
      .select()
      .from(purchases)
      .where(inArray(purchases.paymentStatus, ["paid", "received"])),
  ]);
  return {
    orderedPurchase,
    allPurchases,
    partiallyPaidPurchase,
    completedPurchase,
  };
}
export async function getPurchasesItems() {
  return (
    db
      .select({
        // 1. Spread the table to get all its columns
        ...getTableColumns(purchaseItems),

        // 2. Select specific related columns
        productName: products.name,
        productUnit: units.name,
        sellingPrice: productVariants.sellingPrice,
        productId: products.id,
        trackingType: products.trackingType,
      })
      .from(purchaseItems)
      // 3. Join Variant (Purchase Items link to Variants, not directly to Products!)
      .innerJoin(
        productVariants,
        eq(purchaseItems.variantId, productVariants.id),
      )
      // 4. Join Product (Variants link to Products)
      .innerJoin(products, eq(productVariants.productId, products.id))
      // 5. Join Unit (Products link to Units)
      .leftJoin(units, eq(units.id, products.unitId))
  ); // leftJoin is safer in case a product has no unit
}

export async function createReceivePurchase(data: ReceiveItemsFormValues) {
  const { purchaseId, items, paymentAmount, paymentMethod, paymentNotes } =
    data;

  return db.transaction(async (tx) => {
    const itemIds = basicRequestValidation(items);
    const purchase = await purchaseValidation(tx, purchaseId);

    const existingItems = await purchaseItemsValidation(
      tx,
      purchaseId,
      itemIds,
    );

    const receiveItemMap = new Map(items.map((item) => [item.itemId, item]));

    for (const purchaseItem of existingItems) {
      const receiveItem = receiveItemMap.get(purchaseItem.id);
      if (!receiveItem) {
        throw new NotFoundError(
          `Missing receiving information for purchase item ${purchaseItem.id}.`,
        );
      }
      await receiveItemsValidation(purchaseItem, receiveItem);

      if (receiveItem.trackingType === "batch") {
        batchValidation(purchaseItem, receiveItem);
      }

      if (receiveItem.trackingType === "serial") {
        serialNumberValidation(purchaseItem, receiveItem);
      }
    }

    for (const purchaseItem of existingItems) {
      const receiveItem = receiveItemMap.get(purchaseItem.id)!;

      if (receiveItem.receiveNow <= 0) {
        continue;
      }

      const newReceivedQuantity =
        purchaseItem.receivedQuantity + receiveItem.receiveNow;

      await updatePurchaseItems(tx, purchaseItem.id, newReceivedQuantity);

      await insertInventoryStockOnConflictDoUpdate(
        tx,
        purchaseItem.variantId,
        receiveItem.receiveNow,
      );

      await insertInventoryMovements(
        tx,
        purchaseItem.variantId,
        purchaseId,
        receiveItem.receiveNow,
      );

      if (receiveItem.trackingType === "batch") {
        await insertInventoryBatches(
          tx,
          receiveItem,
          purchaseItem.variantId,
          purchaseItem.id,
        );
      }

      if (receiveItem.trackingType === "serial") {
        await insertSerialNumbers(
          tx,
          receiveItem,
          purchaseItem.variantId,
          purchaseItem.id,
        );
      }
    }

    const allPurchaseItems = await getAllPurchaseItems(tx, purchaseId);

    const newStatus = calculatePurchaseStatus(allPurchaseItems);

    const {
      updatedPaidAmount,
      receivedAmount,
      updatedDueAmount,
      newPaymentAmount,
    } = calculatePayments(
      allPurchaseItems,
      purchase.paidAmount,
      paymentAmount,
      purchase.totalAmount,
    );

    const paymentStatus = calculatePaymentStatus(
      updatedPaidAmount,
      purchase.totalAmount,
      receivedAmount,
    );

    // =========================================================
    // 13. UPDATE PURCHASE
    // =========================================================

    await updatePurchase(
      tx,
      newStatus,
      updatedPaidAmount,
      updatedDueAmount,
      paymentStatus,
      purchaseId,
    );

    // =========================================================
    // 14. PAYMENT RECORD
    // =========================================================

    if (newPaymentAmount > 0) {
      await insertPurchasePayments(
        tx,
        purchaseId,
        paymentMethod,
        newPaymentAmount,
        paymentNotes,
      );
    }

    // =========================================================
    // 15. RETURN
    // =========================================================

    return {
      success: true,
      purchaseId,
      status: newStatus,
      receivedAmount,
      paidAmount: updatedPaidAmount,
      dueAmount: updatedDueAmount,
      message:
        newStatus === "received"
          ? "Purchase completely received."
          : "Purchase partially received.",
    };
  });
}
