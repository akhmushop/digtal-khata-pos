import express, { json } from "express";
import { pool } from "../config/db.js";
const router = express.Router();
router.get("/api/customers", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM customers");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
  }
});
router.post("/api/customers", async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const result = await pool.query(
      "INSERT INTO customers(name, phone, address) VALUES ($1,$2,$3) RETURNING *",
      [name, phone, address],
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
  }
});
export default router;
