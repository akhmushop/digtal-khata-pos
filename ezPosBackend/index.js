import express from "express";
import { pool } from "./db.js";
import cors from "cors";
const app = express();
// middleware
app.use(cors());
app.use(express.json());
// routes

const PORT = 3000;

app.post("/products", async (req, res) => {
  
    const  {id , barcode, productName,productUnit,productType,alertQuantity,cost,price,discountPercent,flatDiscount,quantity,batchNumber,expiryDate,description,brand,category,tags,supplier,image,status,createdAt,sku,weight,dimensions}  = req.body;
    const newProduct = await pool.query("INSERT INTO products (id,barcode,productname,productunit,producttype,alertquantity,cost,price,discountpercent,flatdiscount,quantity,batchnumber,expirydate,description,brand,category,tags,supplier,image,status,createdat,sku,weight,dimensions) VALUES($1)", [id , barcode, productName,productUnit,productType,alertQuantity,cost,price,discountPercent,flatDiscount,quantity,batchNumber,expiryDate,description,brand,category,tags,supplier,image,status,createdAt,sku,weight,dimensions]);
    res.json(newProduct);
  
});
app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
