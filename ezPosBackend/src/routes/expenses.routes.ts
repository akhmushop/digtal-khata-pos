import express from "express";
import { pool } from "../config/db.js";
const router = express.Router();
router.post("/api/expenses", async (req, res) => {
  const {
    title,
    expense_date,
    amount,
    category_id,
    payment_method,
    reference_no,
    note,
  } = req.body;
  await pool.query(
    "INSERT INTO expenses(title,expense_date,amount,payment_method,reference_no,note,category_id) VALUES($1,$2,$3,$4,$5,$6,$7)",
    [
      title,
      expense_date,
      amount,
      payment_method,
      reference_no,
      note,
      category_id,
    ],
  );
});
router.get("/api/expense_categories", async (req, res) => {
  const result = await pool.query("SELECT * FROM expense_categories");
  res.json(result.rows);
});
export default router;
