import express from "express";
import { pool } from "../config/db.js";
import type { ChangedItems } from "../types/changedItems-types.js";
import { db } from "../db/schema/index.js";
import {
  products,
  purchaseItems,
  purchaseReturnItems,
  purchaseReturns,
  supplierLedger,
} from "../db/schema.js";
import { eq, inArray, sql } from "drizzle-orm";
import { error } from "node:console";
const router = express.Router();
router.post("/api/purchase-return", async (req, res) => {
  try {
    const { orderId, changedItems } = req.body;

    // 1. Extract all IDs from the frontend payload
    const itemIds = changedItems.map((item: ChangedItems) => Number(item.id));

    let total_amount = 0;

    if (itemIds.length > 0) {
      // 2. Fetch all cost prices in ONE single database query
      // const { rows: purchaseItemsResult } = await pool.query(
      //   "SELECT id, cost_price FROM purchase_items WHERE id = ANY($1::int[])",
      //   [itemIds],
      // );

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
          return res
            .status(400)
            .json({ error: `Item with ID ${item.id} not found.` });
        }

        total_amount += Number(item.returnPurchaseQty) * costPrice;
      }
      // const {
      //   rows: [{ id: purchaseReturnId }],
      // } = await pool.query(
      //   "INSERT INTO purchase_returns (purchase_id, supplier_id, total_amount) VALUES ($1, $2, $3) RETURNING id",
      //   [orderId, 1, total_amount],
      // );
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
          return res.status(404).json({ error: "Price not found" });
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
      // await pool.query(
      //   `INSERT INTO supplier_ledger (supplier_id, transaction_type, reference_id,credit, note) VALUES ($1, $2, $3, $4, $5)`,
      //   [
      //     1,
      //     "PURCHASE_RETURN",
      //     purchaseReturnId,
      //     total_amount,
      //     `Purchase Return #${purchaseReturnId}`,
      //   ],
      // );
      await db.insert(supplierLedger).values({
        supplierId: 1,
        transactionType: "PURCHASE_RETURN",
        referenceId: purchaseReturnId,
        credit: total_amount,
        note: `Purchase Return #${purchaseReturnId}`,
      });
    }

    // Proceed to save total_amount to the database...
  } catch (err) {
    console.error(err);
  }
});
router.get("/api/purchases/return-items", async (req, res) => {
  try {
    const result = await db
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
    res.json(result);
  } catch (err) {
    console.error(err);
  }
});
export default router;
