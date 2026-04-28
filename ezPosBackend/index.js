import express from "express";
import { pool } from "./db.js";
import cors from "cors";
const app = express();
// middleware
app.use(cors());
app.use(express.json());
// routes

const PORT = 3000;

app.post("/api/products", async (req, res) => {
const product = req.body
const keys = Object.keys(product)
const values = Object.values(product)
const columns = keys.join(",")
const placeholders = keys.map((_,i) => `$${i+1}`).join(",")
const newProduct = await pool.query(`INSERT INTO products (${columns}) VALUES (${placeholders})`,values)
  res.json(newProduct.rows);
});

app.get("/api/products", async (req, res) => {
    const products = await pool.query("SELECT * FROM products");
    res.json(products.rows);
});

app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
