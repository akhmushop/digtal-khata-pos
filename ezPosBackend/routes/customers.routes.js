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
    const result = await pool.query(`WITH payment_summary AS (
    SELECT sale_id,
        SUM(PAID_AMOUNT) AS TOTAL_PAID
    FROM SALE_PAYMENTS
    GROUP BY SALE_ID
)
SELECT C.ID AS CUSTOMER_ID,
    COALESCE(
        SUM(S.FINAL_TOTAL - COALESCE(PS.TOTAL_PAID, 0)),
        0
    ) AS TOTAL_DUE,
    COALESCE(SUM(PS.TOTAL_PAID), 0) AS TOTAL_PAID,
    COALESCE(SUM(s.FINAL_TOTAL), 0) AS TOTAL_AMOUNT
FROM customers c
    JOIN SALES S ON S.CUSTOMER_ID = C.ID
    LEFT JOIN payment_summary PS ON PS.SALE_ID = S.ID
WHERE S.PAYMENT_STATUS in ('unpaid', 'partial')
GROUP BY C.ID
HAVING COALESCE(
        SUM(S.FINAL_TOTAL - COALESCE(PS.TOTAL_PAID, 0)),
        0
    ) > 0`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
  }
});
export default router;
