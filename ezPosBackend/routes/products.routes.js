import express, { json } from "express";
import { pool } from "../config/db.js";
const router = express.Router();

router.get("/api/products", async (req, res) => {
  try {
    const products = await pool.query("SELECT * FROM products");
    res.json(products.rows);
  } catch (err) {
    console.error(err);
  }
});
router.post("/api/products", async (req, res) => {
  try {
    const product = req.body;
    const keys = Object.keys(product);
    const values = Object.values(product).map((value) =>
      typeof value === "object" ? JSON.stringify(value) : value,
    );
    const columns = keys.join(",");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");
    const newProduct = await pool.query(
      `INSERT INTO products (${columns}) VALUES (${placeholders}) RETURNING *`,
      values,
    );
    res.json(newProduct.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
router.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const updatedQuantity = quantity - 1;
    const updateProductQuantity = await pool.query(
      "UPDATE products SET quantity = $1 WHERE id = $2",
      [updatedQuantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
router.put("/api/products/remove/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const updatedQuantity = quantity - 1;
    const removeProductQuantity = await pool.query(
      "UPDATE products SET quantity = $1 WHERE id = $2",
      [updatedQuantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
router.put("/api/products/add/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const updatedQuantity = quantity + 1;
    const addProductQuantity = await pool.query(
      "UPDATE products SET quantity = $1 WHERE id = $2",
      [updatedQuantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
router.put("/api/products/restore/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { sold_quantity, quantity } = req.body;
    const updatedQuantity = quantity + sold_quantity;
    const restoreProductQuantity = await pool.query(
      "UPDATE products SET quantity = $1 WHERE id = $2",
      [updatedQuantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
router.put("/api/products/custom/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { new_quantity, prev_quantity, products_quantity } = req.body;
    const updatedQuantity = products_quantity - (new_quantity - prev_quantity);
    const addCustomProductQuantity = await pool.query(
      "UPDATE products SET quantity = $1 WHERE id = $2",
      [updatedQuantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
router.put("/api/products/restore_all/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { sold_quantity, products_quantity } = req.body;
    const updatedQuantity = products_quantity + sold_quantity;
    const restoreProductQuantity = await pool.query(
      "UPDATE products SET quantity = $1 WHERE id = $2",
      [updatedQuantity, id],
    );
  } catch (err) {
    console.error(err);
  }
});
router.put("/api/products/update_stock/:id", async (req, res) => {
  const { id } = req.params;
  const { newStock, status } = req.body;
  const insertNewStock = await pool.query(
    "UPDATE products SET quantity = $1, status = $2 WHERE id = $3",
    [newStock, status, id],
  );
  res.json(id);
});
router.delete("/api/products/remove_product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteProduct = await pool.query(
      "DELETE FROM products WHERE id = $1",
      [id],
    );
  } catch (err) {
    console.error(err);
  }
});
router.post("/api/products/duplicate-product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = req.body;
    const keys = Object.keys(product).filter((p) => p !== "id");
    const values = Object.values(product);
    const copyColumns = keys
      .map((p) => {
        if (p === "product_name") {
          return (p = "product_name || '(copy)'");
        } else if (p === "barcode") p = "barcode || '(copy)'";
        return p;
      })
      .join(",");
    const columns = keys.join(",");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");
    const newProduct = await pool.query(
      `INSERT INTO products (${columns})  SELECT ${copyColumns}  FROM products WHERE id = $1`,
      [id],
    );
    // res.json(newProduct.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
router.patch("/api/products/updated_product/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const update_product = req.body;
    if (Object.keys(update_product).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    const keys = Object.keys(update_product);
    const values = Object.values(update_product).map((value) =>
      typeof value === "object" ? JSON.stringify(value) : value,
    );
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(", ");
    values.push(id);
    const result = await pool.query(
      `UPDATE products SET ${setClause} WHERE id = $${values.length}`,
      values,
    );
  } catch (err) {
    console.error(err);
  }
});
export default router;
