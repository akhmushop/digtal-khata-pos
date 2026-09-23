import { error } from "node:console";
import { db } from "../../db/schema/index.js";
import { purchaseItems } from "../../db/schema/purchaseItems.js";
import { purchases } from "../../db/schema/purchases.js";
import type { purchasesUpdateInput } from "../../types/purchases-type.js";
import { eq, getTableColumns, inArray } from "drizzle-orm";
import { products } from "../../db/schema/products.js";
import type { ChangedItems } from "../../types/changedItems-types.js";
import { NotFoundError } from "../../utils/handleError.js";
import type { CreatePurchaseInput } from "./schemas/purchase.schema.js";
import { suppliers } from "../../db/schema/suppliers.js";
import { productVariants } from "../../db/schema/productVariants.js";

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
  return db
    .select({
      purchaseItems,
      productName: products.productName,
      productUnit: products.productUnit,
      price: products.price,
      cost: products.cost,
    })
    .from(purchaseItems)
    .innerJoin(products, eq(purchaseItems.productId, products.id));
}
export async function createPurchaseUpdate(input: purchasesUpdateInput) {
  const { paymentDetails, changedItems } = input;
  const changedFields = changedItems.find(
    (item: ChangedItems) => item.changedFields === true,
  );
  const { orderId, payment_amount, payment_method, payment_notes } =
    paymentDetails;
  if (!orderId || payment_amount === undefined) {
    throw new NotFoundError("Missing orderId or payment_amount");
  }
  return db.transaction(async (tx) => {
    const purchaseRows = await tx
      .select({
        paidAmount: purchases.paidAmount,
        dueAmount: purchases.dueAmount,
        finalTotal: purchases.finalTotal,
      })
      .from(purchases)
      .where(eq(purchases.id, orderId))
      .for("update");
    if (purchaseRows.length === 0) {
      throw new NotFoundError("Purchase order not found");
    }

    const grandTotal = changedItems.reduce(
      (total: number, item: ChangedItems) => {
        const quantity = item.receiveQuantity ?? 0;
        const price = item.purchasePrice ?? 0;
        return total + quantity * price;
      },
      0,
    );
    const currentPaid = Number(purchaseRows[0]?.paidAmount) || 0;
    const currentDue = Number(purchaseRows[0]?.dueAmount) || 0;
    const payment = payment_amount || 0;
    const purchaseItemsResult = await tx
      .select({
        costPrice: purchaseItems.costPrice,
        receiveQuantity: purchaseItems.receiveQuantity,
      })
      .from(purchaseItems)
      .where(eq(purchaseItems.purchaseId, orderId));
    const receivedItemsTotalCost = purchaseItemsResult.reduce(
      (sum, item) =>
        sum + Number(item.costPrice) * Number(item.receiveQuantity),
      0,
    );
    const amountToReceive =
      Number(purchaseRows[0]?.finalTotal) - Number(receivedItemsTotalCost);
    const updatedDue =
      Number(currentDue) +
      (Number(grandTotal) - Number(amountToReceive)) -
      Number(payment);
    const updatedPaidAmount = currentPaid + payment;
    const newStatus = !changedFields ? "received" : "partially_received";
    await tx
      .update(purchases)
      .set({
        status: newStatus,
        paidAmount: updatedPaidAmount,
        dueAmount: updatedDue,
        note: payment_notes,
        paymentStatus:
          updatedPaidAmount <= 0
            ? "unpaid"
            : updatedPaidAmount < Number(purchaseRows[0]?.finalTotal)
              ? "partial_paid"
              : "paid",
      })
      .where(eq(purchases.id, orderId));
    for (let item of changedItems) {
      const { id, product_id, receiveQuantity, purchasePrice, sellingPrice } =
        item;
      const productRows = await tx
        .select({
          price: products.price,
          cost: products.cost,
          quantity: products.quantity,
        })
        .from(products)
        .where(eq(products.id, product_id))
        .for("update");
      if (productRows.length === 0) {
        throw new Error(`Product with id ${product_id} not found`);
      }
      const updatedQuantity =
        receiveQuantity != null
          ? Number(receiveQuantity) + productRows[0]!.quantity
          : productRows[0]?.quantity;
      const updatedCost =
        purchasePrice != null ? Number(purchasePrice) : productRows[0]?.cost;
      const updatedPrice =
        sellingPrice != null ? Number(sellingPrice) : productRows[0]?.price;
      const alreadyReceiveQuantity = await tx
        .select()
        .from(purchaseItems)
        .where(eq(purchaseItems.id, id))
        .for("update");
      if (alreadyReceiveQuantity.length === 0) {
        throw new Error(`Product with id ${id} not found`);
      }
      const itemsReceived =
        Number(alreadyReceiveQuantity[0]?.receiveQuantity) ===
        Number(alreadyReceiveQuantity[0]?.quantity);
      const updatedAlreadyReceiveQuantity =
        receiveQuantity != null
          ? Number(receiveQuantity) +
            Number(alreadyReceiveQuantity[0]?.receiveQuantity)
          : alreadyReceiveQuantity[0]?.receiveQuantity;

      if (!itemsReceived) {
        await tx
          .update(purchaseItems)
          .set({
            costPrice: updatedCost,
            receiveQuantity: updatedAlreadyReceiveQuantity,
          })
          .where(eq(purchaseItems.id, id));
        await tx
          .update(products)
          .set({
            quantity: updatedQuantity,
            cost: updatedCost,
            price: updatedPrice,
          })
          .where(eq(products.id, product_id));
      }
    }
    return { orderId, newStatus, updatedDue, updatedPaidAmount };
  });
}
