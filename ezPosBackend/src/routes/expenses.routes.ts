import express from "express";
import { pool } from "../config/db.js";
import { db } from "../db/schema/index.js";
import { expenses } from "../db/schema.js";
const router = express.Router();
router.post("/api/expenses", async (req, res) => {
  try {
    const {
      title,
      expense_date,
      amount,
      category_id,
      payment_method,
      reference_no,
      note,
    } = req.body;
    await db.insert(expenses).values({
      title,
      expenseDate: expense_date,
      amount,
      categoryId: category_id,
      paymentMethod: payment_method,
      referenceNo: reference_no,
      note,
    });
  } catch (err) {
    console.error(err);
  }
});
router.get("/api/expense_categories", async (req, res) => {
  const result = await pool.query("SELECT * FROM expense_categories");
  res.json(result.rows);
});
export default router;
