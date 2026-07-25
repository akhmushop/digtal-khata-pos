import { eq, inArray, sql } from "drizzle-orm";
import { purchaseItems } from "../../db/schema/purchaseItems.js";
import type { ChangedItems } from "../../types/changedItems-types.js";
import { db } from "../../db/schema/index.js";
import { purchaseReturns } from "../../db/schema/purchaseReturns.js";
import { supplierLedger } from "../../db/schema/supplierLedger.js";
import { purchaseReturnItems } from "../../db/schema/purchaseReturnItems.js";
import { error } from "node:console";
import { products } from "../../db/schema/products.js";

export async function createPurchaseReturn({
  orderId,
  changedItems,
}: {
  orderId: number;
  changedItems: ChangedItems[];
}) {
  const itemIds = changedItems.map((item: ChangedItems) => Number(item.id));
  let total_amount = 0;

  if (itemIds.length > 0) {
    const purchaseItemsResult = await db
      .select({
        id: purchaseItems.id,
        costPrice: purchaseItems.costPrice,
      })
      .from(purchaseItems)
      .where(inArray(purchaseItems.id, itemIds));
    // 3. Create a quick lookup map for the prices { id: cost_price }
    const priceMap = new Map(
      purchaseItemsResult.map((row) => [row.id, Number(row.costPrice)]),
    );

    // 4. Calculate the total amount
    for (let item of changedItems) {
      const costPrice = priceMap.get(Number(item.id));

      if (costPrice === undefined) {
        // Handle error: an item ID was sent from the frontend that doesn't exist in DB
        throw new Error(`Item with ID ${item.id} not found.`);
      }

      total_amount += Number(item.returnPurchaseQty) * costPrice;
    }
    const [purchaseReturn] = await db
      .insert(purchaseReturns)
      .values({
        purchaseId: orderId,
        supplierId: 1,
        totalAmount: total_amount,
      })
      .returning({ id: purchaseReturns.id });
    if (!purchaseReturn) {
      throw new Error("Failed to create purchase return");
    }
    const purchaseReturnId = purchaseReturn.id;
    for (let item of changedItems) {
      const costPrice = priceMap.get(Number(item.id));
      if (costPrice === undefined) {
        throw new Error("Price not found");
      }
      const { returnPurchaseQty, product_id, id } = item;
      await db.insert(purchaseReturnItems).values({
        purchaseReturnId,
        purchaseItemId: id,
        productId: product_id,
        quantity: returnPurchaseQty,
        unitPrice: costPrice,
      });
    }
    await db.insert(supplierLedger).values({
      supplierId: 1,
      transactionType: "PURCHASE_RETURN",
      referenceId: purchaseReturnId,
      credit: total_amount,
      note: `Purchase Return #${purchaseReturnId}`,
    });
  }
}
export async function getPurchaseReturnItems() {
  return await db
    .select({
      purchaseItemId: purchaseReturnItems.purchaseItemId,
      returnQuantity: sql<number>`
          COALESCE(SUM(${purchaseReturnItems.quantity}), 0)
        `.as("return_quantity"),
    })
    .from(purchaseReturnItems)
    .innerJoin(products, eq(purchaseReturnItems.productId, products.id))
    .innerJoin(
      purchaseItems,
      eq(purchaseReturnItems.purchaseItemId, purchaseItems.id),
    )
    .groupBy(purchaseReturnItems.purchaseItemId);
}
