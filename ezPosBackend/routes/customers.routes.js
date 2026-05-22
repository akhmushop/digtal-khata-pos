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
router.get("/api/due_by_customers", async (req, res) => {
  try {
    const result = await pool.query(`SELECT C.ID AS CUSTOMER_ID,
    COALESCE(
        SUM(S.FINAL_TOTAL) - SUM(COALESCE(SP.PAID_AMOUNT, 0)),
        0
    ) AS TOTAL_DUE,
    COALESCE(SUM(SP.PAID_AMOUNT), 0) AS TOTAL_PAID,
    COALESCE(SUM(s.FINAL_TOTAL), 0) AS TOTAL_AMOUNT
FROM customers c
    JOIN SALES S ON S.CUSTOMER_ID = C.ID
    LEFT JOIN SALE_PAYMENTS SP ON SP.SALE_ID = S.ID
GROUP BY C.ID
HAVING COALESCE(
        SUM(S.FINAL_TOTAL) - SUM(COALESCE(SP.PAID_AMOUNT, 0)),
        0
    ) > 0`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
  }
});
export default router;
