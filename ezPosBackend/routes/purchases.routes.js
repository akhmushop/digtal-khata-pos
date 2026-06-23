import express from "express";
import { pool } from "../config/db.js";
const router = express.Router();
router.post("/api/purchases", async (req, res) => {
  const { purchasesCart, final_total, supplier, note } = req.body;

  const purchasesId = await pool.query(
    "INSERT INTO purchases (supplier_name,final_total,due_amount,note) VALUES ($1,$2,$3,$4) RETURNING id",
    [supplier.name, final_total, final_total, note],
  );
  for (let item of purchasesCart) {
    const { id, purchaseQty, cost } = item;
    await pool.query(
      "INSERT INTO purchase_items (purchase_id,product_id,quantity,cost_price) VALUES($1,$2,$3,$4)",
      [purchasesId.rows[0].id, id, purchaseQty, cost],
    );
  }
});
router.get("/api/purchases", async (req, res) => {
  const result = await pool.query("SELECT * FROM purchases");
  res.json(result.rows);
});
router.get("/api/purchases/items", async (req, res) => {
  const result = await pool.query(`SELECT PI.*,
    P.product_name,
    p.product_unit,
    P.PRICE
FROM purchase_items PI
    JOIN products P ON PI.product_id = P.id;`);
  res.json(result.rows);
});
router.post("/api/purchases/updates", async (req, res) => {
  const client = await pool.connect();
  try {
    const { paymentDetails, changedItems } = req.body;
    const { orderId, payment_amount, payment_method, payment_notes } =
      paymentDetails;
    if (!orderId || payment_amount === undefined) {
      return res
        .status(400)
        .json({ error: "Missing orderId or payment_amount" });
    }
    await client.query("BEGIN");
    const { rows } = await client.query(
      "SELECT paid_amount, due_amount FROM purchases WHERE id = $1 FOR UPDATE ",
      [orderId],
    );
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Purchase order not found" });
    }
    const currentPaid = parseFloat(rows[0].paid_amount) || 0;
    const currentDue = parseFloat(rows[0].due_amount) || 0;
    const payment = parseFloat(payment_amount) || 0;

    const updatedPaidAmount = currentPaid + payment;
    const updatedDueAmount = currentDue - payment;
    const newStatus =
      changedItems.length === 0 ? "received" : "partially_received";

    await client.query(
      `UPDATE purchases 
       SET status = $1, 
           paid_amount = $2, 
           due_amount = $3,
           note = $4,
           payment_status = CASE 
               WHEN $2::numeric <= 0 THEN 'unpaid' 
               WHEN $2::numeric < final_total THEN 'partial_paid' 
               ELSE 'paid' 
           END 
       WHERE id = $5`,
      [newStatus, updatedPaidAmount, updatedDueAmount, payment_notes, orderId],
    );
    for (let item of changedItems) {
      const { id, product_id, receiveQuantity, purchasePrice, sellingPrice } =
        item;
      const { rows } = await client.query(
        "SELECT price,cost ,quantity FROM products WHERE id  = $1 FOR UPDATE ",
        [product_id],
      );
      if (rows.length === 0) {
        throw new Error(`Product with id ${product_id} not found`);
      }
      const updatedQuantity =
        receiveQuantity != null
          ? Number(receiveQuantity) + rows[0].quantity
          : rows[0].quantity;
      const updatedCost =
        purchasePrice != null ? Number(purchasePrice) : rows[0].cost;
      const updatedPrice =
        sellingPrice != null ? Number(sellingPrice) : rows[0].price;
      await client.query(
        "UPDATE products SET quantity = $1 ,cost = $2 ,price = $3 WHERE id = $4 ",
        [updatedQuantity, updatedCost, updatedPrice, product_id],
      );
    }
    await client.query("COMMIT");
    res.status(200).json({ message: "Purchase order updated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating purchase:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.release();
  }
});
export default router;
