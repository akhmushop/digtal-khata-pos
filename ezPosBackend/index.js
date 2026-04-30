import express from "express";
import { pool } from "./db.js";
import cors from "cors";
const app = express();
// middleware
app.use(cors());
app.use(express.json());
// routes

const PORT = 3000;
app.get("/api/products", async (req, res) => {
  try {
    const products = await pool.query("SELECT * FROM products");
    res.json(products.rows);
  } catch (err) {
    console.err(err);
  }
});
app.post("/api/products", async (req, res) => {
  try {
    const product = req.body;
    const keys = Object.keys(product);
    const values = Object.values(product);
    const columns = keys.join(",");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");
    const newProduct = await pool.query(
      `INSERT INTO products (${columns}) VALUES (${placeholders})`,
      values,
    );
    res.json(newProduct.rows);
  } catch (err) {
    console.error(err);
  }
});
app.put("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const updatedQuantity = quantity - 1;
    const updateProductQuantity = await pool.query(
      "UPDATE products SET quantity = $1 WHERE id = $2",
      [updatedQuantity, id],
    );
    res.json();
  } catch (err) {
    console.error(err);
  }
});

app.get("/api/cart", async (req, res) => {
  try {
    const cart = await pool.query("SELECT * FROM cart");
    res.json(cart.rows);
  } catch (err) {
    console.error(err);
  }
});
app.post("/api/cart", async (req, res) => {
  const cart = req.body;
  const keys = Object.keys(cart);
  const values = Object.values(cart);
  const columns = keys.join(",");
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");
  const addToCart = await pool.query(
    `INSERT INTO cart (${columns}) VALUES (${placeholders}) `,
    values,
  );
  res.json(addToCart.rows);
});
app.put("/api/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const increaseQuantity = quantity + 1;
    const updatedQuantity = await pool.query(
      "UPDATE cart SET sold_quantity = $1 WHERE id = $2",
      [increaseQuantity, id],
    );
    res.json(updatedQuantity);
  } catch (err) {
    console.error(err);
  }
});
app.delete("/api/cart/:id", async (req, res) => {
  try {
    const {id} = req.params;
    const removeCartItem = await pool.query("DELETE FROM cart WHERE id = $1",[id])
    console.log(id)
  res.json(id)
  } catch (err) {
    console.error(err)
  }
})
app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
