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
  const {
    id,
    barcode,
    productName,
    productUnit,
    productType,
    alertQuantity,
    cost,
    price,
    discountPercent,
    flatDiscount,
    quantity,
    batchNumber,
    expiryDate,
    description,
    brand,
    category,
    tags,
    supplier,
    image,
    status,
    createdAt,
    sku,
    weight,
    dimensions,
  } = req.body;
  const newProduct = await pool.query(
    "INSERT INTO products (barcode,productname,productunit,producttype,alertquantity,cost,price,discountpercent,flatdiscount,quantity,batchnumber,expirydate,description,brand,category,tags,supplier,image,status,createdat,sku,weight,dimensions,id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)",
    [
      barcode,
      productName,
      productUnit,
      productType,
      alertQuantity,
      cost,
      price,
      discountPercent,
      flatDiscount,
      quantity,
      batchNumber,
      expiryDate,
      description,
      brand,
      category,
      tags,
      supplier,
      image,
      status,
      createdAt,
      sku,
      weight,
      dimensions,
      id,
    ],
  );
  res.json(newProduct);
});

app.get("/api/products", async (req, res) => {
    const products = await pool.query("SELECT * FROM products");
    res.json(products.rows);
});

app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
