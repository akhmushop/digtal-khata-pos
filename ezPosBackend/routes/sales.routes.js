import express from "express";
import { pool } from "../config/db.js";
const router = express.Router();
router.get("/api/sold_products", async (req, res) => {
  try {
    const sold_products = await pool.query(
      "SELECT s.id AS sale_id,si.id AS sale_items_id,p.id,p.product_name,p.category, p.cost, p.price ,si.sold_quantity, si.sold_price, s.created_at FROM sale_items si JOIN sales s ON si.sale_id = s.id JOIN products p ON si.product_id = p.id WHERE si.status = 'completed' AND s.status = 'completed'",
    );
    res.json(sold_products.rows);
  } catch (err) {
    console.error(err);
  }
});
router.post("/api/sold_products", async (req, res) => {
  try {
    const cart = req.body;
    const insertSale = await pool.query(
      "INSERT INTO sales DEFAULT VALUES RETURNING id",
    );
    const salesId = insertSale.rows[0].id;
    for (let item of cart) {
      const insertSoldProducts = await pool.query(
        "INSERT INTO sale_items (sale_id, product_id, sold_quantity, sold_price) VALUES ($1,$2,$3,$4)",
        [salesId, item.id, item.sold_quantity, item.price],
      );
    }
  } catch (err) {
    console.error(err);
  }
});
router.post("/api/sold_products/refund/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateStatus = await pool.query(
      "UPDATE sale_items SET status = 'refunded' WHERE id = $1",
      [id],
    );
    const sale_items = await pool.query(
      "SELECT * FROM sale_items WHERE id = $1",
      [id],
    );
    const refund = await pool.query(
      "INSERT INTO sale_refund_items (refund_id) VALUES ($1)",
      [id],
    );
    const updateProductStock = await pool.query(
      "UPDATE products SET quantity =quantity + $1 WHERE id = $2",
      [sale_items.rows[0].sold_quantity, sale_items.rows[0].product_id],
    );
  } catch (err) {
    console.error(err);
  }
});
router.post("/api/sold_products/refunds_all/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const items = await pool.query(
      "SELECT * FROM sale_items WHERE sale_id=$1 AND status = 'completed'",
      [id],
    );
    await pool.query("INSERT INTO sale_refunds(sale_id) VALUES ($1)", [id]);
    for (let item of items.rows) {
      await pool.query(
        "UPDATE products SET quantity =quantity + $1 WHERE id = $2",
        [item.sold_quantity, item.product_id],
      );
      await pool.query(
        "UPDATE sale_items SET status = 'refunded' WHERE sale_id  = $1",
        [item.sale_id],
      );
    }
    await pool.query("UPDATE sales SET status = 'refunded' WHERE id = $1", [
      id,
    ]);
  } catch (err) {
    console.error(err);
  }
});
export default router;
