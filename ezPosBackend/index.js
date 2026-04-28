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

app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
