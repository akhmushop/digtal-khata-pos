import express from "express";
import { pool } from "../config/db.js";
const router = express.Router();
router.post("/api/purchase-return", async (req, res) => {
  try {
    const { orderId, changedItems } = req.body;

    // 1. Extract all IDs from the frontend payload
    const itemIds = changedItems.map((item) => Number(item.id));

    let total_amount = 0;

    if (itemIds.length > 0) {
      // 2. Fetch all cost prices in ONE single database query
      const { rows: purchaseItemsResult } = await pool.query(
        "SELECT id, cost_price FROM purchase_items WHERE id = ANY($1::int[])",
        [itemIds],
      );

      // 3. Create a quick lookup map for the prices { id: cost_price }
      const priceMap = new Map(
        purchaseItemsResult.map((row) => [row.id, Number(row.cost_price)]),
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
      const {
        rows: [{ id: purchaseReturnId }],
      } = await pool.query(
        "INSERT INTO purchase_returns (purchase_id, supplier_id, total_amount) VALUES ($1, $2, $3) RETURNING id",
        [orderId, 1, total_amount],
      );
      for (let item of changedItems) {
        const costPrice = priceMap.get(Number(item.id));
        const { returnPurchaseQty, product_id, id } = item;
        await pool.query(
          "INSERT INTO purchase_return_items (purchase_return_id,purchase_item_id,product_id,quantity,unit_price) VALUES ($1, $2, $3,$4,$5)",
          [purchaseReturnId, id, product_id, returnPurchaseQty, costPrice],
        );
      }
      await pool.query(
        `INSERT INTO supplier_ledger (supplier_id, transaction_type, reference_id,credit, note) VALUES ($1, $2, $3, $4, $5)`,
        [
          1,
          "PURCHASE_RETURN",
          purchaseReturnId,
          total_amount,
          `Purchase Return #${purchaseReturnId}`,
        ],
      );
    }

    // Proceed to save total_amount to the database...
  } catch (err) {
    console.error(err);
  }
});
export default router;
