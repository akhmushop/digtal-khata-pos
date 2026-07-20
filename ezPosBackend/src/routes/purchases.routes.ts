import express from "express";
import { pool } from "../config/db.js";
import type { ChangedItems } from "../types/changedItems-types.js";
import { db } from "../db/index.js";
import { products, purchaseItems, purchases } from "../db/schema.js";
import { error } from "node:console";
import { and, eq, inArray } from "drizzle-orm";
const router = express.Router();
router.post("/api/purchases", async (req, res) => {
  try {
    const { purchasesCart, final_total, supplier, note } = req.body;

    // const purchasesId = await pool.query(
    //   "INSERT INTO purchases (supplier_name,final_total,due_amount,note) VALUES ($1,$2,$3,$4) RETURNING id",
    //   [supplier.name, final_total, final_total, note],
    // );
    const [purchaseId] = await db
      .insert(purchases)
      .values({
        supplierName: supplier.name,
        finalTotal: final_total,
        dueAmount: final_total,
        note,
      })
      .returning({ id: purchases.id });
    if (!purchaseId?.id) {
      return res.status(500).json({ error: "Purchase id not found" });
    }
    for (let item of purchasesCart) {
      const { id, purchaseQty, cost } = item;
      // await pool.query(
      //   "INSERT INTO purchase_items (purchase_id,product_id,quantity,cost_price) VALUES($1,$2,$3,$4)",
      //   [purchaseId.id, id, purchaseQty, cost],
      // );
      db.insert(purchaseItems).values({
        purchaseId: purchaseId.id,
        productId: id,
        quantity: purchaseQty,
        costPrice: cost,
      });
    }
  } catch (err) {
    console.error(err);
  }
});
router.get("/api/purchases", async (req, res) => {
  try {
    const [
      orderedPurchase,
      allPurchases,
      partiallyPaidPurchase,
      completedPurchase,
    ] = await Promise.all([
      db.select().from(purchases).where(eq(purchases.status, "ordered")),
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
    res.json({
      orderedPurchase,
      allPurchases,
      partiallyPaidPurchase,
      completedPurchase,
    });
  } catch (err) {
    console.error(err);
  }
});
router.get("/api/purchases/items", async (req, res) => {
  try {
    //     const result = await pool.query(`SELECT PI.*,
    //     P.product_name,
    //     p.product_unit,
    //     P.PRICE,
    //     P.COST
    // FROM purchase_items PI
    //     JOIN products P ON PI.product_id = P.id;`);
    const result = await db
      .select({
        purchaseItems,
        productName: products.productName,
        productUnit: products.productUnit,
        price: products.price,
        cost: products.cost,
      })
      .from(purchaseItems)
      .innerJoin(products, eq(purchaseItems.productId, products.id));
    res.json(result);
  } catch (err) {
    console.error(err);
  }
});
router.post("/api/purchases/updates", async (req, res) => {
  try {
    const { paymentDetails, changedItems } = req.body;
    const changedFields = changedItems.find(
      (item: ChangedItems) => item.changedFields === true,
    );
    const { orderId, payment_amount, payment_method, payment_notes } =
      paymentDetails;
    if (!orderId || payment_amount === undefined) {
      return res
        .status(400)
        .json({ error: "Missing orderId or payment_amount" });
    }
    await db.transaction(async (tx) => {
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
        throw new Error("Purchase order not found");
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
      const payment = parseFloat(payment_amount) || 0;
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
      res.status(200).json({ message: "Purchase order updated successfully" });
    });
  } catch (err: unknown) {
    console.error(err);
    if (err instanceof Error) {
      if (err.message.includes("not found")) {
        return res.status(404).json({ error: err.message });
      }
    }
    res.status(500).json({
      error: "Transaction Failed",
    });
  }
});
export default router;
