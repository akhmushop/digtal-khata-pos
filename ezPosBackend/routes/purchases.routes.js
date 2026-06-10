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
      [purchasesId.rows[0].id, id, purchaseQty, cost]
    );
  }
});
router.get("/api/purchases", async (req, res) => {
  const result = await pool.query('SELECT * FROM purchases')
  res.json(result.rows)
})
export default router;
