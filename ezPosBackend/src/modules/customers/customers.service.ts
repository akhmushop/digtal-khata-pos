import { eq, inArray, sql } from "drizzle-orm";
import { customers } from "../../db/schema/customers.js";
import { db } from "../../db/schema/index.js";
import { salePayments } from "../../db/schema/salePayments.js";
import { sales } from "../../db/schema/sales.js";

export async function getCustomers() {
  const allCustomers = db.select().from(customers);
  return allCustomers;
}
export async function createCustomer(
  name: string,
  phone: string,
  address: string,
) {
  const [customer] = await db
    .insert(customers)
    .values({ name, phone, address })
    .returning();
  return customer;
}
export async function getCustomerDueSummary() {
  const paymentSummaryCte = db.$with("payment_summary").as(
    db
      .select({
        saleId: salePayments.saleId,
        totalPaid: sql<number>`SUM(${salePayments.amount})`.as(
          "total_paid",
        ),
      })
      .from(salePayments)
      .groupBy(salePayments.saleId),
  );
  return db
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
}
