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
  
    const  {description}  = req.body;
    const newProduct = await pool.query("INSERT INTO test (description) VALUES($1)", [description]);
    res.json(newProduct);
  
});
app.listen(PORT, () => console.log(`server is running on PORT ${PORT}`));
