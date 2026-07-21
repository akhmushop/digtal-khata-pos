import express, { json } from "express";
import { pool } from "../config/db.js";
import { db } from "../db/index.js";
import { customers, salePayments, sales } from "../db/schema.js";
import { eq, inArray, sql } from "drizzle-orm";
const router = express.Router();
router.get("/api/customers", async (req, res) => {
  try {
    const result = db.select().from(customers);
    res.json(result);
  } catch (err) {
    console.error(err);
  }
});
router.post("/api/customers", async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const [customer] = await db
      .insert(customers)
      .values({ name, phone, address })
      .returning();
    res.json(customer);
  } catch (err) {
    console.error(err);
  }
});
router.get("/api/due_by_customers", async (req, res) => {
  try {
    const paymentSummaryCte = db.$with("payment_summary").as(
      db
        .select({
          saleId: salePayments.saleId,
          totalPaid: sql<number>`SUM(${salePayments.paidAmount})`.as(
            "total_paid",
          ),
        })
        .from(salePayments)
        .groupBy(salePayments.saleId),
    );
    const paymentSummary = await db
      .with(paymentSummaryCte)
      .select({
        customerId: customers.id,
        totalDue:
          sql<number>`COALESCE(SUM(${sales.finalTotal} - COALESCE(${paymentSummaryCte.totalPaid}, 0)),0)`.as(
            "TOTAL_DUE",
          ),
        totalPaid:
          sql<number>`COALESCE(SUM(${paymentSummaryCte.totalPaid}), 0)`.as(
            "TOTAL_PAID",
          ),
        totalAmount: sql<number>`COALESCE(SUM(${sales.finalTotal}), 0)`.as(
          "TOTAL_AMOUNT",
        ),
      })
      .from(customers)
      .innerJoin(sales, eq(sales.customerId, customers.id))
      .leftJoin(paymentSummaryCte, eq(paymentSummaryCte.saleId, sales.id))
      .where(inArray(sales.paymentStatus, ["unpaid", "partial"]))
      .groupBy(customers.id)
      .having(
        sql`COALESCE(SUM(${sales.finalTotal} - COALESCE(${paymentSummaryCte.totalPaid}, 0)),0) > 0`,
      );
    res.json(paymentSummary);
  } catch (err) {
    console.error(err);
  }
});
export default router;
