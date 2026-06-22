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
  const { paymentDetails, changedItems } = req.body;
  const { orderId, payment_amount, payment_method, payment_notes } =
    paymentDetails;
  const { rows } = await pool.query(
    "SELECT paid_amount, due_amount FROM purchases WHERE id = $1 LIMIT 1",
    [orderId],
  );
  const { paid_amount, due_amount } = rows[0] || {};
  const updatedPaidAmount = Number(paid_amount) + payment_amount;
  const updatedDueAmount = Number(due_amount) - payment_amount;
  console.log(typeof paid_amount, payment_amount);
  await pool.query(
    "UPDATE purchases SET paid_amount = $1 ,due_amount = $2 , payment_status = CASE WHEN ($1::numeric) <=0 THEN 'unpaid' WHEN ($1::numeric) < final_total THEN 'partial_paid' ELSE 'paid' END WHERE ID =$3",
    [updatedPaidAmount, updatedDueAmount, orderId],
  );
  for (let item of changedItems) {
  }
  console.log(orderId, payment_amount, payment_method, payment_notes);
});
export default router;
