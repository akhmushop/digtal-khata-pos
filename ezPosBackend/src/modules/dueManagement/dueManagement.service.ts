import { asc, eq, sql } from "drizzle-orm";
import { db } from "../../db/schema/index.js";
import { customers } from "../../db/schema/customers.js";
import { purchasePayments } from "../../db/schema/purchasePayments.js";
import { purchases } from "../../db/schema/purchases.js";
import { salePayments } from "../../db/schema/salePayments.js";
import { sales } from "../../db/schema/sales.js";
import { suppliers } from "../../db/schema/suppliers.js";
import { BadRequestError, NotFoundError } from "../../utils/handleError.js";

const toNumber = (value: number | string | null | undefined) => Number(value ?? 0);

const paymentStatusFromRemaining = (remaining: number, total: number) => {
  if (total <= 0) return "paid";
  if (remaining <= 0) return "paid";
  if (remaining < total) return "partial";
  return "unpaid";
};

export async function getDueManagementSummary() {
  const [customerSummary, supplierSummary, cashSummary] = await Promise.all([
    db
      .select({
        totalOutstanding: sql<number>`COALESCE(SUM(${sales.finalTotal} - COALESCE( (SELECT SUM(${salePayments.amount}) FROM ${salePayments} WHERE ${salePayments.saleId} = ${sales.id}), 0 )), 0)`.as(
          "total_outstanding",
        ),
        totalOverdue: sql<number>`COALESCE(SUM(CASE WHEN ${sales.paymentStatus} IN ('unpaid','partial') AND ${sales.saleDate} < NOW() - INTERVAL '7 days' THEN ${sales.finalTotal} - COALESCE((SELECT SUM(${salePayments.amount}) FROM ${salePayments} WHERE ${salePayments.saleId} = ${sales.id}), 0) ELSE 0 END), 0)`.as(
          "total_overdue",
        ),
      })
      .from(sales)
      .where(sql`${sales.paymentStatus} IN ('unpaid', 'partial')`),
    db
      .select({
        totalOutstanding: sql<number>`COALESCE(SUM(${purchases.totalAmount} - COALESCE((SELECT SUM(${purchasePayments.amount}) FROM ${purchasePayments} WHERE ${purchasePayments.purchaseId} = ${purchases.id}), 0)), 0)`.as(
          "total_outstanding",
        ),
        totalOverdue: sql<number>`COALESCE(SUM(CASE WHEN ${purchases.paymentStatus} IN ('unpaid','partial') AND ${purchases.purchaseDate} < NOW() - INTERVAL '7 days' THEN ${purchases.totalAmount} - COALESCE((SELECT SUM(${purchasePayments.amount}) FROM ${purchasePayments} WHERE ${purchasePayments.purchaseId} = ${purchases.id}), 0) ELSE 0 END), 0)`.as(
          "total_overdue",
        ),
      })
      .from(purchases)
      .where(sql`${purchases.paymentStatus} IN ('unpaid', 'partial')`),
    db
      .select({
        collectedToday: sql<number>`COALESCE(SUM(CASE WHEN ${salePayments.paymentDate} >= DATE_TRUNC('day', NOW()) THEN ${salePayments.amount} ELSE 0 END), 0)`.as(
          "collected_today",
        ),
        paidToSuppliersToday: sql<number>`COALESCE(SUM(CASE WHEN ${purchasePayments.paymentDate} >= DATE_TRUNC('day', NOW()) THEN ${purchasePayments.amount} ELSE 0 END), 0)`.as(
          "paid_to_suppliers_today",
        ),
      })
      .from(salePayments)
      .crossJoin(purchasePayments),
  ]);

  return {
    customerOutstanding: toNumber(customerSummary[0]?.totalOutstanding ?? 0),
    customerOverdue: toNumber(customerSummary[0]?.totalOverdue ?? 0),
    supplierOutstanding: toNumber(supplierSummary[0]?.totalOutstanding ?? 0),
    supplierOverdue: toNumber(supplierSummary[0]?.totalOverdue ?? 0),
    amountCollectedToday: toNumber(cashSummary[0]?.collectedToday ?? 0),
    amountPaidToSuppliersToday: toNumber(
      cashSummary[0]?.paidToSuppliersToday ?? 0,
    ),
  };
}

export async function getCustomerDueRows() {
  const rows = await db
    .select({
      id: sales.id,
      customerId: customers.id,
      customerName: customers.name,
      phone: customers.phone,
      invoiceNumber: sales.invoiceNumber,
      invoiceDate: sales.saleDate,
      totalAmount: sales.finalTotal,
      paidAmount: sql<number>`COALESCE((SELECT SUM(${salePayments.amount}) FROM ${salePayments} WHERE ${salePayments.saleId} = ${sales.id}), 0)`.as(
        "paid_amount",
      ),
      outstandingAmount: sql<number>`COALESCE(${sales.finalTotal} - (SELECT SUM(${salePayments.amount}) FROM ${salePayments} WHERE ${salePayments.saleId} = ${sales.id}), 0)`.as(
        "outstanding_amount",
      ),
      paymentStatus: sales.paymentStatus,
      isOverdue: sql<boolean>`(${sales.saleDate} < NOW() - INTERVAL '7 days' AND ${sales.paymentStatus} IN ('unpaid','partial'))`.as(
        "is_overdue",
      ),
    })
    .from(sales)
    .leftJoin(customers, eq(customers.id, sales.customerId))
    .where(sql`${sales.paymentStatus} IN ('unpaid', 'partial')`)
    .orderBy(asc(sales.saleDate));

  return rows.map((row) => ({
    ...row,
    totalAmount: toNumber(row.totalAmount),
    paidAmount: toNumber(row.paidAmount),
    outstandingAmount: toNumber(row.outstandingAmount),
    invoiceDate: row.invoiceDate ? new Date(row.invoiceDate).toISOString() : null,
    dueDate: null,
    isOverdue: Boolean(row.isOverdue),
  }));
}

export async function getSupplierDueRows() {
  const rows = await db
    .select({
      id: purchases.id,
      supplierId: suppliers.id,
      supplierName: suppliers.name,
      phone: suppliers.phone,
      purchaseInvoice: purchases.purchaseOrderNumber,
      purchaseDate: purchases.purchaseDate,
      totalAmount: purchases.totalAmount,
      paidAmount: sql<number>`COALESCE((SELECT SUM(${purchasePayments.amount}) FROM ${purchasePayments} WHERE ${purchasePayments.purchaseId} = ${purchases.id}), 0)`.as(
        "paid_amount",
      ),
      outstandingAmount: sql<number>`COALESCE(${purchases.totalAmount} - (SELECT SUM(${purchasePayments.amount}) FROM ${purchasePayments} WHERE ${purchasePayments.purchaseId} = ${purchases.id}), 0)`.as(
        "outstanding_amount",
      ),
      paymentStatus: purchases.paymentStatus,
      isOverdue: sql<boolean>`(${purchases.purchaseDate} < NOW() - INTERVAL '7 days' AND ${purchases.paymentStatus} IN ('unpaid','partial'))`.as(
        "is_overdue",
      ),
    })
    .from(purchases)
    .leftJoin(suppliers, eq(suppliers.id, purchases.supplierId))
    .where(sql`${purchases.paymentStatus} IN ('unpaid', 'partial')`)
    .orderBy(asc(purchases.purchaseDate));

  return rows.map((row) => ({
    ...row,
    totalAmount: toNumber(row.totalAmount),
    paidAmount: toNumber(row.paidAmount),
    outstandingAmount: toNumber(row.outstandingAmount),
    purchaseDate: row.purchaseDate ? new Date(row.purchaseDate).toISOString() : null,
    dueDate: null,
    isOverdue: Boolean(row.isOverdue),
  }));
}

export async function recordCustomerPayment(payload: {
  saleId: number;
  customerId?: number | null;
  amount: number;
  paymentMethod: "cash" | "bangla_qr" | "card";
  reference?: string | null;
  tendered?: number | null;
  notes?: string | null;
  paymentDate?: string | null;
}) {
  const { saleId, amount, paymentMethod, reference, tendered, notes } = payload;

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new BadRequestError("Payment amount must be greater than zero.");
  }

  const [sale] = await db
    .select({
      id: sales.id,
      customerId: sales.customerId,
      finalTotal: sales.finalTotal,
      invoiceNumber: sales.invoiceNumber,
    })
    .from(sales)
    .where(eq(sales.id, saleId))
    .limit(1);

  if (!sale) {
    throw new NotFoundError("Sale not found.");
  }

  const paidTotal = toNumber(
    (
      await db
        .select({ total: sql<number>`COALESCE(SUM(${salePayments.amount}), 0)` })
        .from(salePayments)
        .where(eq(salePayments.saleId, saleId))
    )[0]?.total ?? 0,
  );
  const remaining = Math.max(0, toNumber(sale.finalTotal) - paidTotal);

  if (amount > remaining) {
    throw new BadRequestError(
      `Payment cannot exceed the outstanding balance (${remaining.toFixed(2)}).`,
    );
  }

  return db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(salePayments)
      .values({
        saleId,
        customerId: sale.customerId,
        amount,
        paymentMethod,
        reference: reference?.trim() || null,
        tendered: tendered ?? null,
        paymentDate: payload.paymentDate
          ? new Date(payload.paymentDate).toISOString()
          : new Date().toISOString(),
        notes: notes?.trim() || null,
      })
      .returning();

    const nextPaid = paidTotal + amount;
    const nextOutstanding = Math.max(0, toNumber(sale.finalTotal) - nextPaid);
    const nextStatus = paymentStatusFromRemaining(nextOutstanding, toNumber(sale.finalTotal));

    await tx
      .update(sales)
      .set({ dueAmount: nextOutstanding, paymentStatus: nextStatus })
      .where(eq(sales.id, saleId));

    return {
      saleId,
      invoiceNumber: sale.invoiceNumber,
      paymentId: inserted?.id ?? 0,
      amount,
      outstandingAfter: nextOutstanding,
      paymentStatus: nextStatus,
    };
  });
}

export async function recordSupplierPayment(payload: {
  purchaseId: number;
  amount: number;
  method: "cash" | "bank_transfer" | "cheque" | "card" | "other";
  notes?: string | null;
  paymentDate?: string | null;
}) {
  const { purchaseId, amount, method, notes } = payload;

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new BadRequestError("Payment amount must be greater than zero.");
  }

  const [purchase] = await db
    .select({
      id: purchases.id,
      totalAmount: purchases.totalAmount,
      paidAmount: purchases.paidAmount,
      purchaseOrderNumber: purchases.purchaseOrderNumber,
    })
    .from(purchases)
    .where(eq(purchases.id, purchaseId))
    .limit(1);

  if (!purchase) {
    throw new NotFoundError("Purchase not found.");
  }

  const paidTotal = toNumber(purchase.paidAmount ?? 0);
  const remaining = Math.max(0, toNumber(purchase.totalAmount) - paidTotal);
  if (amount > remaining) {
    throw new BadRequestError(
      `Payment cannot exceed the outstanding payable balance (${remaining.toFixed(2)}).`,
    );
  }

  return db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(purchasePayments)
      .values({
        purchaseId,
        amount,
        method,
        notes: notes?.trim() || null,
        paymentDate: payload.paymentDate ? new Date(payload.paymentDate) : new Date(),
      })
      .returning();

    const nextPaid = paidTotal + amount;
    const nextOutstanding = Math.max(0, toNumber(purchase.totalAmount) - nextPaid);
    const nextStatus = paymentStatusFromRemaining(nextOutstanding, toNumber(purchase.totalAmount));

    await tx
      .update(purchases)
      .set({
        paidAmount: nextPaid,
        dueAmount: nextOutstanding,
        paymentStatus: nextStatus,
        updatedAt: new Date(),
      })
      .where(eq(purchases.id, purchaseId));

    return {
      purchaseId,
      purchaseOrderNumber: purchase.purchaseOrderNumber,
      paymentId: inserted?.id ?? 0,
      amount,
      outstandingAfter: nextOutstanding,
      paymentStatus: nextStatus,
    };
  });
}

export async function getCustomerLedger(customerId: number) {
  const [customer] = await db
    .select({ id: customers.id, name: customers.name, phone: customers.phone })
    .from(customers)
    .where(eq(customers.id, customerId));

  if (!customer) {
    throw new NotFoundError("Customer not found.");
  }

  const saleRows = await db
    .select({
      transactionDate: sales.saleDate,
      reference: sales.invoiceNumber,
      description: sql<string>`'Sale invoice'`,
      debit: sales.finalTotal,
      credit: sql<number>`0`,
    })
    .from(sales)
    .where(eq(sales.customerId, customerId));

  const paymentRows = await db
    .select({
      transactionDate: salePayments.paymentDate,
      reference: salePayments.reference,
      description: sql<string>`'Payment received'`,
      debit: sql<number>`0`,
      credit: salePayments.amount,
    })
    .from(salePayments)
    .where(eq(salePayments.customerId, customerId));

  const rows = [...saleRows, ...paymentRows]
    .map((row) => ({
      ...row,
      transactionDate: row.transactionDate ? new Date(row.transactionDate).toISOString() : null,
      reference: row.reference ?? "-",
      debit: toNumber(row.debit),
      credit: toNumber(row.credit),
    }))
    .sort(
      (a, b) =>
        new Date(a.transactionDate ?? 0).getTime() -
        new Date(b.transactionDate ?? 0).getTime(),
    );

  let runningBalance = 0;
  return {
    customer,
    openingBalance: 0,
    transactions: rows.map((row) => {
      runningBalance += row.debit - row.credit;
      return { ...row, runningBalance };
    }),
  };
}

export async function getSupplierLedger(supplierId: number) {
  const [supplier] = await db
    .select({ id: suppliers.id, name: suppliers.name, phone: suppliers.phone })
    .from(suppliers)
    .where(eq(suppliers.id, supplierId));

  if (!supplier) {
    throw new NotFoundError("Supplier not found.");
  }

  const purchaseRows = await db
    .select({
      transactionDate: purchases.purchaseDate,
      reference: purchases.purchaseOrderNumber,
      description: sql<string>`'Purchase invoice'`,
      debit: purchases.totalAmount,
      credit: sql<number>`0`,
    })
    .from(purchases)
    .where(eq(purchases.supplierId, supplierId));

  const paymentRows = await db
    .select({
      transactionDate: purchasePayments.paymentDate,
      reference: sql<string>`CAST(${purchasePayments.id} AS TEXT)`,
      description: sql<string>`'Supplier payment'`,
      debit: sql<number>`0`,
      credit: purchasePayments.amount,
    })
    .from(purchasePayments)
    .where(
      eq(
        purchasePayments.purchaseId,
        sql`(SELECT ${purchases.id} FROM ${purchases} WHERE ${purchases.supplierId} = ${supplierId})`,
      ),
    );

  const rows = [...purchaseRows, ...paymentRows]
    .map((row) => ({
      ...row,
      transactionDate: row.transactionDate ? new Date(row.transactionDate).toISOString() : null,
      reference: row.reference ?? "-",
      debit: toNumber(row.debit),
      credit: toNumber(row.credit),
    }))
    .sort(
      (a, b) =>
        new Date(a.transactionDate ?? 0).getTime() -
        new Date(b.transactionDate ?? 0).getTime(),
    );

  let runningBalance = 0;
  return {
    supplier,
    openingBalance: 0,
    transactions: rows.map((row) => {
      runningBalance += row.debit - row.credit;
      return { ...row, runningBalance };
    }),
  };
}
