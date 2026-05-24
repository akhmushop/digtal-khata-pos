import express from "express";
import { pool } from "../config/db.js";
const router = express.Router();
router.post("/api/expenses", async (req, res) => {
  const {
    title,
    expense_date,
    amount,
    category,
    payment_method,
    reference_no,
    note,
  } = req.body;
  await pool.query(
    "INSERT INTO expenses(title,expense_date,amount,payment_method,reference_no,note) VALUES($1,$2,$3,$4,$5,$6)",
    [title, expense_date, amount, payment_method, reference_no, note],
  );
});
export default router;
