import express from "express";
import { pool } from "../config/db.js";
const router = express.Router();

router.get("/api/cart", async (req, res) => {
  try {
    const cart = await pool.query("SELECT * FROM cart");
    res.json(cart.rows);
  } catch (err) {
    console.error(err);
  }
});
router.post("/api/cart", async (req, res) => {
  const cart = req.body;
  const keys = Object.keys(cart);
  const values = Object.values(cart);
  const columns = keys.join(",");
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");
  const addToCart = await pool.query(
    `INSERT INTO cart (${columns}) VALUES (${placeholders}) `,
    values,
  );
});
router.put("/api/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const increaseQuantity = quantity + 1;
    const updatedQuantity = await pool.query(
      "UPDATE cart SET sold_quantity = $1 WHERE id = $2",
      [increaseQuantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
router.delete("/api/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const removeCartItem = await pool.query("DELETE FROM cart WHERE id = $1", [
      id,
    ]);
  } catch (err) {
    console.error(err);
  }
});
router.put("/api/cart/add/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { sold_quantity } = req.body;
    const updatedQuantity = sold_quantity + 1;
    const addCartQuantity = await pool.query(
      "UPDATE  cart SET sold_quantity = $1 WHERE id = $2",
      [updatedQuantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
router.put("/api/cart/remove/:id", async (req, res) => {
  const { id } = req.params;
  const { sold_quantity } = req.body;
  const updatedQuantity = sold_quantity - 1;
  const updateCartQuantity = await pool.query(
    "UPDATE cart SET sold_quantity = $1 WHERE id = $2",
    [updatedQuantity, id],
  );
});
router.put("/api/cart/custom/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { sold_quantity } = req.body;
    const updateCustomCartQuantity = await pool.query(
      "UPDATE cart SET sold_quantity = $1 WHERE id = $2",
      [sold_quantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
router.delete("/api/cart/reset/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resetCart = await pool.query("DELETE FROM cart ");
  } catch (err) {
    console.error(err);
  }
});
router.delete("/api/cart/remove_cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const removeCartItem = await pool.query("DELETE FROM cart WHERE id = $1", [
      id,
    ]);
  } catch (err) {
    console.error(err);
  }
});
export default router;
