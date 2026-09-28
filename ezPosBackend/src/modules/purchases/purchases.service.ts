import { error } from "node:console";
import { db } from "../../db/schema/index.js";
import { purchaseItems } from "../../db/schema/purchaseItems.js";
import { purchases } from "../../db/schema/purchases.js";
import type { purchasesUpdateInput } from "../../types/purchases-type.js";
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
    return newPurchase;
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
// export async function createReceivePurchase(data: ReceiveItemsFormValues) {
//   console.log(data)
//   const { paymentDetails, changedItems } = input;
//   const changedFields = changedItems.find(
//     (item: ChangedItems) => item.changedFields === true,
//   );
//   const { orderId, payment_amount, payment_method, payment_notes } =
//     paymentDetails;
//   if (!orderId || payment_amount === undefined) {
//     throw new NotFoundError("Missing orderId or payment_amount");
//   }
//   return db.transaction(async (tx) => {
//     const purchaseRows = await tx
//       .select({
//         paidAmount: purchases.paidAmount,
//         dueAmount: purchases.dueAmount,
//         finalTotal: purchases.finalTotal,
//       })
//       .from(purchases)
//       .where(eq(purchases.id, orderId))
//       .for("update");
//     if (purchaseRows.length === 0) {
//       throw new NotFoundError("Purchase order not found");
//     }

//     const grandTotal = changedItems.reduce(
//       (total: number, item: ChangedItems) => {
//         const quantity = item.receiveQuantity ?? 0;
//         const price = item.purchasePrice ?? 0;
//         return total + quantity * price;
//       },
//       0,
//     );
//     const currentPaid = Number(purchaseRows[0]?.paidAmount) || 0;
//     const currentDue = Number(purchaseRows[0]?.dueAmount) || 0;
//     const payment = payment_amount || 0;
//     const purchaseItemsResult = await tx
//       .select({
//         costPrice: purchaseItems.costPrice,
//         receiveQuantity: purchaseItems.receiveQuantity,
//       })
//       .from(purchaseItems)
//       .where(eq(purchaseItems.purchaseId, orderId));
//     const receivedItemsTotalCost = purchaseItemsResult.reduce(
//       (sum, item) =>
//         sum + Number(item.costPrice) * Number(item.receiveQuantity),
//       0,
//     );
//     const amountToReceive =
//       Number(purchaseRows[0]?.finalTotal) - Number(receivedItemsTotalCost);
//     const updatedDue =
//       Number(currentDue) +
//       (Number(grandTotal) - Number(amountToReceive)) -
//       Number(payment);
//     const updatedPaidAmount = currentPaid + payment;
//     const newStatus = !changedFields ? "received" : "partially_received";
//     await tx
//       .update(purchases)
//       .set({
//         status: newStatus,
//         paidAmount: updatedPaidAmount,
//         dueAmount: updatedDue,
//         note: payment_notes,
//         paymentStatus:
//           updatedPaidAmount <= 0
//             ? "unpaid"
//             : updatedPaidAmount < Number(purchaseRows[0]?.finalTotal)
//               ? "partial_paid"
//               : "paid",
//       })
//       .where(eq(purchases.id, orderId));
//     for (let item of changedItems) {
//       const { id, product_id, receiveQuantity, purchasePrice, sellingPrice } =
//         item;
//       const productRows = await tx
//         .select({
//           price: products.price,
//           cost: products.cost,
//           quantity: products.quantity,
//         })
//         .from(products)
//         .where(eq(products.id, product_id))
//         .for("update");
//       if (productRows.length === 0) {
//         throw new Error(`Product with id ${product_id} not found`);
//       }
//       const updatedQuantity =
//         receiveQuantity != null
//           ? Number(receiveQuantity) + productRows[0]!.quantity
//           : productRows[0]?.quantity;
//       const updatedCost =
//         purchasePrice != null ? Number(purchasePrice) : productRows[0]?.cost;
//       const updatedPrice =
//         sellingPrice != null ? Number(sellingPrice) : productRows[0]?.price;
//       const alreadyReceiveQuantity = await tx
//         .select()
//         .from(purchaseItems)
//         .where(eq(purchaseItems.id, id))
//         .for("update");
//       if (alreadyReceiveQuantity.length === 0) {
//         throw new Error(`Product with id ${id} not found`);
//       }
//       const itemsReceived =
//         Number(alreadyReceiveQuantity[0]?.receiveQuantity) ===
//         Number(alreadyReceiveQuantity[0]?.quantity);
//       const updatedAlreadyReceiveQuantity =
//         receiveQuantity != null
//           ? Number(receiveQuantity) +
//             Number(alreadyReceiveQuantity[0]?.receiveQuantity)
//           : alreadyReceiveQuantity[0]?.receiveQuantity;

//       if (!itemsReceived) {
//         await tx
//           .update(purchaseItems)
//           .set({
//             costPrice: updatedCost,
//             receiveQuantity: updatedAlreadyReceiveQuantity,
//           })
//           .where(eq(purchaseItems.id, id));
//         await tx
//           .update(products)
//           .set({
//             quantity: updatedQuantity,
//             cost: updatedCost,
//             price: updatedPrice,
//           })
//           .where(eq(products.id, product_id));
//       }
//     }
//     return { orderId, newStatus, updatedDue, updatedPaidAmount };
//   });
// }
export async function createReceivePurchase(data: ReceiveItemsFormValues) {
  const { purchaseId, items, paymentAmount, paymentMethod, paymentNotes } =
    data;

  return db.transaction(async (tx) => {
    // =========================================================
    // 1. BASIC REQUEST VALIDATION
    // =========================================================

    if (items.length === 0) {
      throw new NotFoundError("At least one purchase item is required.");
    }

    // Prevent duplicate item IDs in the request
    const itemIds = items.map((item) => item.itemId);
    const uniqueItemIds = new Set(itemIds);

    if (uniqueItemIds.size !== itemIds.length) {
      throw new NotFoundError("Duplicate purchase item IDs are not allowed.");
    }

    // =========================================================
    // 2. LOCK PURCHASE
    // =========================================================

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

    // =========================================================
    // 3. LOCK PURCHASE ITEMS
    // =========================================================

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

    // =========================================================
    // 4. CREATE QUICK LOOKUP MAP
    // =========================================================

    const receiveItemMap = new Map(items.map((item) => [item.itemId, item]));

    // =========================================================
    // 5. VALIDATE EVERYTHING BEFORE MODIFYING DATABASE
    // =========================================================

    for (const purchaseItem of existingItems) {
      const receiveItem = receiveItemMap.get(purchaseItem.id);

      if (!receiveItem) {
        throw new NotFoundError(
          `Missing receiving information for purchase item ${purchaseItem.id}.`,
        );
      }

      // -------------------------------------------------------
      // Receive quantity
      // -------------------------------------------------------

      if (receiveItem.receiveNow <= 0) {
        continue; // Skip items with zero or negative receiveNow
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

      // -------------------------------------------------------
      // Batch validation
      // -------------------------------------------------------

      if (receiveItem.trackingType === "batch") {
        const batches = receiveItem.batches ?? [];

        if (batches.length === 0) {
          throw new NotFoundError(
            `Batch information is required for item ${purchaseItem.id}.`,
          );
        }

        const batchQuantity = batches.reduce(
          (sum, batch) => sum + batch.quantity,
          0,
        );

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
            throw new NotFoundError(
              `Batch quantity must be greater than zero.`,
            );
          }

          if (!batch.batchNumber.trim()) {
            throw new NotFoundError(`Batch number is required.`);
          }
        }
      }

      // -------------------------------------------------------
      // Serial validation
      // -------------------------------------------------------

      if (receiveItem.trackingType === "serial") {
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
    }

    // =========================================================
    // 6. UPDATE EACH PURCHASE ITEM + INVENTORY
    // =========================================================

    for (const purchaseItem of existingItems) {
      const receiveItem = receiveItemMap.get(purchaseItem.id)!;

      if (receiveItem.receiveNow <= 0) {
        continue;
      }

      const newReceivedQuantity =
        purchaseItem.receivedQuantity + receiveItem.receiveNow;

      // -------------------------------------------------------
      // Update purchase item
      // -------------------------------------------------------

      await tx
        .update(purchaseItems)
        .set({
          receivedQuantity: newReceivedQuantity,
        })
        .where(eq(purchaseItems.id, purchaseItem.id));

      // -------------------------------------------------------
      // Update inventory stock
      // -------------------------------------------------------

      await tx
        .insert(inventoryStock)
        .values({
          variantId: purchaseItem.variantId,
          quantity: receiveItem.receiveNow,
        })
        .onConflictDoUpdate({
          target: inventoryStock.variantId,
          set: {
            quantity: sql`
              ${inventoryStock.quantity}
              + ${receiveItem.receiveNow}
            `,
          },
        });

      // -------------------------------------------------------
      // Inventory movement
      // -------------------------------------------------------

      await tx.insert(inventoryMovements).values({
        variantId: purchaseItem.variantId,
        movementType: "purchase",
        referenceType: "purchase",
        referenceId: purchaseId,
        quantity: receiveItem.receiveNow,
      });

      // =======================================================
      // 7. BATCH TRACKING
      // =======================================================

      if (receiveItem.trackingType === "batch") {
        const batches = receiveItem.batches ?? [];

        const batchesToInsert = batches.map((batch) => ({
          variantId: purchaseItem.variantId,
          purchaseItemId: purchaseItem.id,

          batchNumber: batch.batchNumber,

          purchasePrice: receiveItem.unitCost,

          quantityReceived: batch.quantity,
          quantityRemaining: batch.quantity,

          manufacturedDate: batch.manufacturedDate,

          expiryDate: batch.expiryDate,
        }));

        await tx.insert(inventoryBatches).values(batchesToInsert);
      }

      // =======================================================
      // 8. SERIAL TRACKING
      // =======================================================

      if (receiveItem.trackingType === "serial") {
        const serials = receiveItem.serialNumbers ?? [];

        const serialNumbersToInsert = serials.map((serialNumber) => ({
          variantId: purchaseItem.variantId,
          purchaseItemId: purchaseItem.id,
          serialNumber,
        }));

        await tx.insert(serialNumbers).values(serialNumbersToInsert);
      }
    }

    // =========================================================
    // 9. GET ALL PURCHASE ITEMS
    // =========================================================

    const allPurchaseItems = await tx
      .select({
        quantity: purchaseItems.quantity,
        receivedQuantity: purchaseItems.receivedQuantity,
        unitCost: purchaseItems.unitCost,
      })
      .from(purchaseItems)
      .where(eq(purchaseItems.purchaseId, purchaseId));

    // =========================================================
    // 10. CALCULATE PURCHASE STATUS
    // =========================================================

    const allItemsFullyReceived =
      allPurchaseItems.length > 0 &&
      allPurchaseItems.every((item) => item.receivedQuantity >= item.quantity);

    const newStatus = allItemsFullyReceived ? "received" : "partially_received";

    // =========================================================
    // 11. CALCULATE RECEIVED VALUE
    // =========================================================

    const receivedAmount = allPurchaseItems.reduce(
      (sum, item) =>
        sum + Number(item.receivedQuantity) * Number(item.unitCost),
      0,
    );

    // =========================================================
    // 12. PAYMENT
    // =========================================================

    const currentPaidAmount = Number(purchase.paidAmount ?? 0);

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
      Number(purchase.totalAmount ?? receivedAmount) - updatedPaidAmount;

    let paymentStatus: "unpaid" | "partial_paid" | "paid";

    if (updatedPaidAmount <= 0) {
      paymentStatus = "unpaid";
    } else if (
      updatedPaidAmount < Number(purchase.totalAmount ?? receivedAmount)
    ) {
      paymentStatus = "partial_paid";
    } else {
      paymentStatus = "paid";
    }

    // =========================================================
    // 13. UPDATE PURCHASE
    // =========================================================

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

    // =========================================================
    // 14. PAYMENT RECORD
    // =========================================================

    if (newPaymentAmount > 0) {
      await tx.insert(purchasePayments).values({
        purchaseId,
        method: paymentMethod,
        amount: newPaymentAmount,
        notes: paymentNotes,
        paymentDate: new Date(),
      });
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
