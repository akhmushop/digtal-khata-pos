import { sql } from "drizzle-orm";
import { db } from "../../db/schema/index.js";
import type { DateRangeQuery } from "./reports.validation.js";

function getDateBounds(params: DateRangeQuery) {
  const period = params.period || "this_month";
  if (period === "custom" && params.startDate && params.endDate) {
    return {
      start: `${params.startDate} 00:00:00`,
      end: `${params.endDate} 23:59:59.999`,
      startDateOnly: params.startDate,
      endDateOnly: params.endDate,
    };
  }

  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  const fmt = (date: Date) => {
    const yr = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, "0");
    const da = String(date.getDate()).padStart(2, "0");
    return `${yr}-${mo}-${da}`;
  };

  let startDate: string;
  let endDate: string;

  if (period === "today") {
    startDate = fmt(now);
    endDate = fmt(now);
  } else if (period === "yesterday") {
    const yest = new Date(y, m, d - 1);
    startDate = fmt(yest);
    endDate = fmt(yest);
  } else if (period === "7d") {
    const past = new Date(y, m, d - 6);
    startDate = fmt(past);
    endDate = fmt(now);
  } else if (period === "30d") {
    const past = new Date(y, m, d - 29);
    startDate = fmt(past);
    endDate = fmt(now);
  } else if (period === "last_month") {
    const firstDayLastMonth = new Date(y, m - 1, 1);
    const lastDayLastMonth = new Date(y, m, 0);
    startDate = fmt(firstDayLastMonth);
    endDate = fmt(lastDayLastMonth);
  } else if (period === "this_year") {
    const firstDayYear = new Date(y, 0, 1);
    startDate = fmt(firstDayYear);
    endDate = fmt(now);
  } else {
    // this_month
    const firstDay = new Date(y, m, 1);
    startDate = fmt(firstDay);
    endDate = fmt(now);
  }

  return {
    start: `${startDate} 00:00:00`,
    end: `${endDate} 23:59:59.999`,
    startDateOnly: startDate,
    endDateOnly: endDate,
  };
}

// ----------------------------------------------------
// 1. SALES REPORTS
// ----------------------------------------------------

export async function getSalesSummaryReport(params: DateRangeQuery) {
  const { start, end } = getDateBounds(params);

  const dailyResult = await db.execute(sql`
    WITH sale_level AS (
      SELECT 
        s.id,
        DATE(s.created_at)::text AS sale_date,
        s.final_total,
        s.discount,
        COALESCE(sr.refund_total, 0) AS refund_total
      FROM sales s
      LEFT JOIN (
        SELECT sale_id, SUM(refund_total) AS refund_total
        FROM sale_refunds
        GROUP BY sale_id
      ) sr ON sr.sale_id = s.id
      WHERE s.status IN ('completed', 'refunded')
        AND s.created_at >= ${start}::timestamp 
        AND s.created_at <= ${end}::timestamp
    ),
    items_cost AS (
      SELECT 
        si.sale_id,
        SUM((si.selling_price - si.cost_at_sale) * si.quantity) AS profit
      FROM sale_items si
      INNER JOIN sales s ON s.id = si.sale_id
      WHERE s.status IN ('completed', 'refunded')
        AND s.created_at >= ${start}::timestamp 
        AND s.created_at <= ${end}::timestamp
      GROUP BY si.sale_id
    )
    SELECT 
      sl.sale_date,
      COUNT(sl.id)::int AS invoice_count,
      COALESCE(SUM(sl.final_total), 0)::numeric AS gross_sales,
      COALESCE(SUM(sl.discount), 0)::numeric AS total_discount,
      COALESCE(SUM(sl.refund_total), 0)::numeric AS total_refunds,
      COALESCE(SUM(sl.final_total - sl.refund_total), 0)::numeric AS net_sales,
      COALESCE(SUM(ic.profit), 0)::numeric AS gross_profit
    FROM sale_level sl
    LEFT JOIN items_cost ic ON ic.sale_id = sl.id
    GROUP BY sl.sale_date
    ORDER BY sl.sale_date ASC
  `);

  const totalsResult = await db.execute(sql`
    WITH sale_level AS (
      SELECT 
        s.id,
        s.final_total,
        s.discount,
        COALESCE(sr.refund_total, 0) AS refund_total
      FROM sales s
      LEFT JOIN (
        SELECT sale_id, SUM(refund_total) AS refund_total
        FROM sale_refunds
        GROUP BY sale_id
      ) sr ON sr.sale_id = s.id
      WHERE s.status IN ('completed', 'refunded')
        AND s.created_at >= ${start}::timestamp 
        AND s.created_at <= ${end}::timestamp
    ),
    items_cost AS (
      SELECT 
        SUM((si.selling_price - si.cost_at_sale) * si.quantity) AS profit
      FROM sale_items si
      INNER JOIN sales s ON s.id = si.sale_id
      WHERE s.status IN ('completed', 'refunded')
        AND s.created_at >= ${start}::timestamp 
        AND s.created_at <= ${end}::timestamp
    )
    SELECT 
      COUNT(sl.id)::int AS total_invoices,
      COALESCE(SUM(sl.final_total), 0)::numeric AS total_gross_sales,
      COALESCE(SUM(sl.discount), 0)::numeric AS total_discount,
      COALESCE(SUM(sl.refund_total), 0)::numeric AS total_refunds,
      COALESCE(SUM(sl.final_total - sl.refund_total), 0)::numeric AS total_net_sales,
      COALESCE(MAX(ic.profit), 0)::numeric AS total_gross_profit,
      CASE 
        WHEN COALESCE(SUM(sl.final_total), 0) > 0 
        THEN ROUND((COALESCE(MAX(ic.profit), 0) / SUM(sl.final_total)) * 100, 2)
        ELSE 0
      END AS overall_profit_margin
    FROM sale_level sl
    CROSS JOIN items_cost ic
  `);

  return {
    rows: dailyResult.rows,
    totals: totalsResult.rows[0] || {},
    periodBounds: { start, end },
  };
}

export async function getSalesByInvoiceReport(params: DateRangeQuery) {
  const { start, end } = getDateBounds(params);
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;

  const searchFilter = params.search ? `%${params.search}%` : null;

  const countQuery = await db.execute(sql`
    SELECT COUNT(DISTINCT s.id)::int AS total
    FROM sales s
    LEFT JOIN customers c ON c.id = s.customer_id
    WHERE s.created_at >= ${start}::timestamp 
      AND s.created_at <= ${end}::timestamp
      ${params.paymentStatus ? sql`AND s.payment_status = ${params.paymentStatus}` : sql``}
      ${params.customerId ? sql`AND s.customer_id = ${params.customerId}` : sql``}
      ${
        searchFilter
          ? sql`AND (s.invoice_number ILIKE ${searchFilter} OR c.name ILIKE ${searchFilter} OR c.phone ILIKE ${searchFilter})`
          : sql``
      }
  `);

  const listQuery = await db.execute(sql`
    SELECT 
      s.id,
      s.invoice_number AS "invoiceNumber",
      s.created_at AS "createdAt",
      COALESCE(c.name, 'Walk-in Customer') AS "customerName",
      COALESCE(c.phone, '-') AS "customerPhone",
      s.subtotal::numeric,
      s.discount::numeric,
      s.vat::numeric,
      s.final_total::numeric AS "finalTotal",
      s.payment_status AS "paymentStatus",
      s.due_amount::numeric AS "dueAmount",
      s.status,
      COUNT(si.id)::int AS "itemCount",
      COALESCE(MAX(sr.refund_total), 0)::numeric AS "refundAmount"
    FROM sales s
    LEFT JOIN customers c ON c.id = s.customer_id
    LEFT JOIN sale_items si ON si.sale_id = s.id
    LEFT JOIN (
      SELECT sale_id, SUM(refund_total) AS refund_total
      FROM sale_refunds
      GROUP BY sale_id
    ) sr ON sr.sale_id = s.id
    WHERE s.created_at >= ${start}::timestamp 
      AND s.created_at <= ${end}::timestamp
      ${params.paymentStatus ? sql`AND s.payment_status = ${params.paymentStatus}` : sql``}
      ${params.customerId ? sql`AND s.customer_id = ${params.customerId}` : sql``}
      ${
        searchFilter
          ? sql`AND (s.invoice_number ILIKE ${searchFilter} OR c.name ILIKE ${searchFilter} OR c.phone ILIKE ${searchFilter})`
          : sql``
      }
    GROUP BY s.id, c.name, c.phone
    ORDER BY s.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return {
    data: listQuery.rows,
    total: Number(countQuery.rows[0]?.total || 0),
    page,
    limit,
  };
}

export async function getProductSalesReport(params: DateRangeQuery) {
  const { start, end } = getDateBounds(params);
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;

  const searchFilter = params.search ? `%${params.search}%` : null;

  const countQuery = await db.execute(sql`
    SELECT COUNT(DISTINCT pv.id)::int AS total
    FROM sale_items si
    INNER JOIN sales s ON s.id = si.sale_id
    INNER JOIN product_variants pv ON pv.id = si.variant_id
    INNER JOIN products p ON p.id = pv.product_id
    LEFT JOIN categories cat ON cat.id = p.category_id
    LEFT JOIN brands b ON b.id = p.brand_id
    WHERE s.status IN ('completed', 'refunded')
      AND s.created_at >= ${start}::timestamp 
      AND s.created_at <= ${end}::timestamp
      ${params.categoryId ? sql`AND p.category_id = ${params.categoryId}` : sql``}
      ${params.brandId ? sql`AND p.brand_id = ${params.brandId}` : sql``}
      ${searchFilter ? sql`AND (p.name ILIKE ${searchFilter} OR pv.sku ILIKE ${searchFilter})` : sql``}
  `);

  const listQuery = await db.execute(sql`
    SELECT 
      p.id AS "productId",
      p.name AS "productName",
      COALESCE(cat.name, 'Uncategorized') AS "categoryName",
      COALESCE(b.name, '-') AS "brandName",
      pv.sku,
      SUM(si.quantity)::int AS "qtySold",
      COALESCE(SUM(si.selling_price * si.quantity), 0)::numeric AS "grossSales",
      COALESCE(SUM(si.discount * si.quantity), 0)::numeric AS "totalDiscount",
      COALESCE(SUM(si.line_total), 0)::numeric AS "netSales",
      COALESCE(SUM(si.cost_at_sale * si.quantity), 0)::numeric AS "totalCost",
      COALESCE(SUM((si.selling_price - si.cost_at_sale) * si.quantity), 0)::numeric AS "grossProfit",
      CASE 
        WHEN COALESCE(SUM(si.line_total), 0) > 0 
        THEN ROUND(COALESCE(SUM((si.selling_price - si.cost_at_sale) * si.quantity), 0) / SUM(si.line_total) * 100, 2)
        ELSE 0 
      END AS "profitMargin"
    FROM sale_items si
    INNER JOIN sales s ON s.id = si.sale_id
    INNER JOIN product_variants pv ON pv.id = si.variant_id
    INNER JOIN products p ON p.id = pv.product_id
    LEFT JOIN categories cat ON cat.id = p.category_id
    LEFT JOIN brands b ON b.id = p.brand_id
    WHERE s.status IN ('completed', 'refunded')
      AND s.created_at >= ${start}::timestamp 
      AND s.created_at <= ${end}::timestamp
      ${params.categoryId ? sql`AND p.category_id = ${params.categoryId}` : sql``}
      ${params.brandId ? sql`AND p.brand_id = ${params.brandId}` : sql``}
      ${searchFilter ? sql`AND (p.name ILIKE ${searchFilter} OR pv.sku ILIKE ${searchFilter})` : sql``}
    GROUP BY p.id, p.name, cat.name, b.name, pv.sku
    ORDER BY "qtySold" DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return {
    data: listQuery.rows,
    total: Number(countQuery.rows[0]?.total || 0),
    page,
    limit,
  };
}

export async function getCustomerSalesReport(params: DateRangeQuery) {
  const { start, end } = getDateBounds(params);
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;

  const searchFilter = params.search ? `%${params.search}%` : null;

  const countQuery = await db.execute(sql`
    SELECT COUNT(DISTINCT s.customer_id)::int AS total
    FROM sales s
    LEFT JOIN customers c ON c.id = s.customer_id
    WHERE s.status IN ('completed', 'refunded')
      AND s.created_at >= ${start}::timestamp 
      AND s.created_at <= ${end}::timestamp
      ${searchFilter ? sql`AND (c.name ILIKE ${searchFilter} OR c.phone ILIKE ${searchFilter})` : sql``}
  `);

  const listQuery = await db.execute(sql`
    SELECT 
      COALESCE(c.id, 0) AS "customerId",
      COALESCE(c.name, 'Walk-in Customer') AS "customerName",
      COALESCE(c.phone, '-') AS phone,
      COUNT(DISTINCT s.id)::int AS "invoiceCount",
      COALESCE(SUM(s.final_total), 0)::numeric AS "totalSales",
      COALESCE(SUM(s.due_amount), 0)::numeric AS "outstandingDue",
      COALESCE(SUM(s.discount), 0)::numeric AS "totalDiscount"
    FROM sales s
    LEFT JOIN customers c ON c.id = s.customer_id
    WHERE s.status IN ('completed', 'refunded')
      AND s.created_at >= ${start}::timestamp 
      AND s.created_at <= ${end}::timestamp
      ${searchFilter ? sql`AND (c.name ILIKE ${searchFilter} OR c.phone ILIKE ${searchFilter})` : sql``}
    GROUP BY c.id, c.name, c.phone
    ORDER BY "totalSales" DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return {
    data: listQuery.rows,
    total: Number(countQuery.rows[0]?.total || 0),
    page,
    limit,
  };
}

export async function getPaymentMethodReport(params: DateRangeQuery) {
  const { start, end } = getDateBounds(params);

  const result = await db.execute(sql`
    SELECT 
      sp.payment_method AS "paymentMethod",
      COUNT(*)::int AS "paymentCount",
      COALESCE(SUM(sp.amount), 0)::numeric AS "totalAmount"
    FROM sale_payments sp
    WHERE sp.payment_date >= ${start}::timestamp 
      AND sp.payment_date <= ${end}::timestamp
    GROUP BY sp.payment_method
    ORDER BY "totalAmount" DESC
  `);

  return result.rows;
}

export async function getSaleRefundsReport(params: DateRangeQuery) {
  const { start, end } = getDateBounds(params);
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;

  const countQuery = await db.execute(sql`
    SELECT COUNT(sr.id)::int AS total
    FROM sale_refunds sr
    WHERE sr.created_at >= ${start}::timestamp 
      AND sr.created_at <= ${end}::timestamp
  `);

  const listQuery = await db.execute(sql`
    SELECT 
      sr.id,
      sr.created_at AS "createdAt",
      s.invoice_number AS "invoiceNumber",
      COALESCE(c.name, 'Walk-in Customer') AS "customerName",
      sr.reason,
      COALESCE(sr.status, 'completed') AS status,
      sr.refund_total::numeric AS "refundTotal"
    FROM sale_refunds sr
    INNER JOIN sales s ON s.id = sr.sale_id
    LEFT JOIN customers c ON c.id = s.customer_id
    WHERE sr.created_at >= ${start}::timestamp 
      AND sr.created_at <= ${end}::timestamp
    ORDER BY sr.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return {
    data: listQuery.rows,
    total: Number(countQuery.rows[0]?.total || 0),
    page,
    limit,
  };
}

// ----------------------------------------------------
// 2. FINANCIAL & PROFITABILITY REPORTS
// ----------------------------------------------------

export async function getProfitReport(params: DateRangeQuery) {
  const { start, end } = getDateBounds(params);

  const categoryProfit = await db.execute(sql`
    SELECT 
      COALESCE(cat.name, 'Uncategorized') AS "categoryName",
      COALESCE(SUM(si.line_total), 0)::numeric AS "netSales",
      COALESCE(SUM(si.cost_at_sale * si.quantity), 0)::numeric AS "totalCost",
      COALESCE(SUM((si.selling_price - si.cost_at_sale) * si.quantity), 0)::numeric AS "grossProfit",
      CASE 
        WHEN COALESCE(SUM(si.line_total), 0) > 0 
        THEN ROUND(COALESCE(SUM((si.selling_price - si.cost_at_sale) * si.quantity), 0) / SUM(si.line_total) * 100, 2)
        ELSE 0 
      END AS "profitMargin"
    FROM sale_items si
    INNER JOIN sales s ON s.id = si.sale_id
    INNER JOIN product_variants pv ON pv.id = si.variant_id
    INNER JOIN products p ON p.id = pv.product_id
    LEFT JOIN categories cat ON cat.id = p.category_id
    WHERE s.status IN ('completed', 'refunded')
      AND s.created_at >= ${start}::timestamp 
      AND s.created_at <= ${end}::timestamp
    GROUP BY cat.id, cat.name
    ORDER BY "grossProfit" DESC
  `);

  const totals = await db.execute(sql`
    SELECT 
      COALESCE(SUM(si.line_total), 0)::numeric AS "totalNetSales",
      COALESCE(SUM(si.cost_at_sale * si.quantity), 0)::numeric AS "totalCost",
      COALESCE(SUM((si.selling_price - si.cost_at_sale) * si.quantity), 0)::numeric AS "totalGrossProfit",
      CASE 
        WHEN COALESCE(SUM(si.line_total), 0) > 0 
        THEN ROUND(COALESCE(SUM((si.selling_price - si.cost_at_sale) * si.quantity), 0) / SUM(si.line_total) * 100, 2)
        ELSE 0 
      END AS "overallMargin"
    FROM sale_items si
    INNER JOIN sales s ON s.id = si.sale_id
    WHERE s.status IN ('completed', 'refunded')
      AND s.created_at >= ${start}::timestamp 
      AND s.created_at <= ${end}::timestamp
  `);

  return {
    categories: categoryProfit.rows,
    totals: totals.rows[0] || {},
  };
}

export async function getExpenseReport(params: DateRangeQuery) {
  const { startDateOnly, endDateOnly } = getDateBounds(params);
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;

  const countQuery = await db.execute(sql`
    SELECT COUNT(e.id)::int AS total
    FROM expenses e
    WHERE e.expense_date >= ${startDateOnly}::date 
      AND e.expense_date <= ${endDateOnly}::date
  `);

  const listQuery = await db.execute(sql`
    SELECT 
      e.id,
      e.expense_date AS "expenseDate",
      e.title,
      COALESCE(ec.category_name, 'Uncategorized') AS "categoryName",
      e.amount::numeric,
      COALESCE(e.payment_method, '-') AS "paymentMethod",
      COALESCE(e.reference_no, '-') AS "referenceNo",
      e.note
    FROM expenses e
    LEFT JOIN expense_categories ec ON ec.id = e.category_id
    WHERE e.expense_date >= ${startDateOnly}::date 
      AND e.expense_date <= ${endDateOnly}::date
    ORDER BY e.expense_date DESC, e.id DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  const categoryTotals = await db.execute(sql`
    SELECT 
      COALESCE(ec.category_name, 'Uncategorized') AS "categoryName",
      COUNT(e.id)::int AS "expenseCount",
      COALESCE(SUM(e.amount), 0)::numeric AS "totalAmount"
    FROM expenses e
    LEFT JOIN expense_categories ec ON ec.id = e.category_id
    WHERE e.expense_date >= ${startDateOnly}::date 
      AND e.expense_date <= ${endDateOnly}::date
    GROUP BY ec.category_name
    ORDER BY "totalAmount" DESC
  `);

  const grandTotal = await db.execute(sql`
    SELECT 
      COUNT(e.id)::int AS "totalCount",
      COALESCE(SUM(e.amount), 0)::numeric AS "grandTotal"
    FROM expenses e
    WHERE e.expense_date >= ${startDateOnly}::date 
      AND e.expense_date <= ${endDateOnly}::date
  `);

  return {
    data: listQuery.rows,
    total: Number(countQuery.rows[0]?.total || 0),
    categoryTotals: categoryTotals.rows,
    summary: grandTotal.rows[0] || {},
    page,
    limit,
  };
}

export async function getCustomerReceivablesReport(params: DateRangeQuery) {
  const searchFilter = params.search ? `%${params.search}%` : null;

  const result = await db.execute(sql`
    SELECT 
      c.id,
      c.name,
      c.phone,
      c.address,
      COUNT(s.id)::int AS "invoiceCount",
      COALESCE(SUM(s.final_total), 0)::numeric AS "totalInvoiced",
      COALESCE(SUM(s.due_amount), 0)::numeric AS "outstandingDue"
    FROM customers c
    INNER JOIN sales s ON s.customer_id = c.id
    WHERE s.status = 'completed' 
      AND s.payment_status IN ('unpaid', 'partial')
      ${searchFilter ? sql`AND (c.name ILIKE ${searchFilter} OR c.phone ILIKE ${searchFilter})` : sql``}
    GROUP BY c.id, c.name, c.phone, c.address
    HAVING SUM(s.due_amount) > 0
    ORDER BY "outstandingDue" DESC
  `);

  const totals = await db.execute(sql`
    SELECT 
      COUNT(DISTINCT c.id)::int AS "customerCount",
      COALESCE(SUM(s.due_amount), 0)::numeric AS "totalReceivable"
    FROM customers c
    INNER JOIN sales s ON s.customer_id = c.id
    WHERE s.status = 'completed' 
      AND s.payment_status IN ('unpaid', 'partial')
  `);

  return {
    customers: result.rows,
    totals: totals.rows[0] || {},
  };
}

// ----------------------------------------------------
// 3. INVENTORY REPORTS
// ----------------------------------------------------

export async function getStockReport(params: DateRangeQuery) {
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;

  const searchFilter = params.search ? `%${params.search}%` : null;

  const countQuery = await db.execute(sql`
    SELECT COUNT(pv.id)::int AS total
    FROM product_variants pv
    INNER JOIN products p ON p.id = pv.product_id
    WHERE (p.status != 'deleted' OR p.status IS NULL)
      ${params.categoryId ? sql`AND p.category_id = ${params.categoryId}` : sql``}
      ${params.brandId ? sql`AND p.brand_id = ${params.brandId}` : sql``}
      ${searchFilter ? sql`AND (p.name ILIKE ${searchFilter} OR pv.sku ILIKE ${searchFilter} OR pv.barcode ILIKE ${searchFilter})` : sql``}
  `);

  const listQuery = await db.execute(sql`
    SELECT 
      p.id AS "productId",
      p.name AS "productName",
      COALESCE(cat.name, 'Uncategorized') AS "categoryName",
      COALESCE(b.name, '-') AS "brandName",
      pv.id AS "variantId",
      pv.sku,
      COALESCE(pv.barcode, '-') AS barcode,
      pv.selling_price::numeric AS "sellingPrice",
      COALESCE(pv.alert_quantity, 0)::int AS "alertQuantity",
      COALESCE(ist.quantity, 0)::int AS "currentStock",
      COALESCE(ist.reserved_quantity, 0)::int AS reserved,
      COALESCE(SUM(ib.quantity_remaining * ib.purchase_price), 0)::numeric AS "stockValue",
      CASE 
        WHEN COALESCE(ist.quantity, 0) <= 0 THEN 'out_of_stock'
        WHEN COALESCE(ist.quantity, 0) <= COALESCE(pv.alert_quantity, 0) THEN 'low_stock'
        ELSE 'in_stock'
      END AS "stockStatus"
    FROM product_variants pv
    INNER JOIN products p ON p.id = pv.product_id
    LEFT JOIN categories cat ON cat.id = p.category_id
    LEFT JOIN brands b ON b.id = p.brand_id
    LEFT JOIN inventory_stock ist ON ist.variant_id = pv.id
    LEFT JOIN inventory_batches ib ON ib.variant_id = pv.id
    WHERE (p.status != 'deleted' OR p.status IS NULL)
      ${params.categoryId ? sql`AND p.category_id = ${params.categoryId}` : sql``}
      ${params.brandId ? sql`AND p.brand_id = ${params.brandId}` : sql``}
      ${searchFilter ? sql`AND (p.name ILIKE ${searchFilter} OR pv.sku ILIKE ${searchFilter} OR pv.barcode ILIKE ${searchFilter})` : sql``}
    GROUP BY p.id, p.name, cat.name, b.name, pv.id, pv.sku, pv.barcode, pv.selling_price, pv.alert_quantity, ist.quantity, ist.reserved_quantity
    ORDER BY p.name ASC, pv.sku ASC
    LIMIT ${limit} OFFSET ${offset}
  `);

  const valuationQuery = await db.execute(sql`
    SELECT 
      COALESCE(SUM(quantity_remaining * purchase_price), 0)::numeric AS "totalValuation",
      COALESCE(SUM(quantity_remaining), 0)::int AS "totalUnits"
    FROM inventory_batches
  `);

  return {
    data: listQuery.rows,
    total: Number(countQuery.rows[0]?.total || 0),
    valuation: valuationQuery.rows[0] || {},
    page,
    limit,
  };
}

export async function getStockMovementReport(params: DateRangeQuery) {
  const { start, end } = getDateBounds(params);
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;

  const countQuery = await db.execute(sql`
    SELECT COUNT(im.id)::int AS total
    FROM inventory_movements im
    WHERE im.created_at >= ${start}::timestamp 
      AND im.created_at <= ${end}::timestamp
  `);

  const listQuery = await db.execute(sql`
    SELECT 
      im.id,
      im.created_at AS "createdAt",
      p.name AS "productName",
      pv.sku,
      im.movement_type AS "movementType",
      im.quantity::int,
      im.reference_type AS "referenceType",
      COALESCE(im.reference_id, 0)::int AS "referenceId"
    FROM inventory_movements im
    INNER JOIN product_variants pv ON pv.id = im.variant_id
    INNER JOIN products p ON p.id = pv.product_id
    WHERE im.created_at >= ${start}::timestamp 
      AND im.created_at <= ${end}::timestamp
    ORDER BY im.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  return {
    data: listQuery.rows,
    total: Number(countQuery.rows[0]?.total || 0),
    page,
    limit,
  };
}

export async function getBatchExpiryReport(params: DateRangeQuery) {
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;

  const countQuery = await db.execute(sql`
    SELECT COUNT(ib.id)::int AS total
    FROM inventory_batches ib
    WHERE ib.quantity_remaining > 0
  `);

  const listQuery = await db.execute(sql`
    SELECT 
      ib.id,
      ib.batch_number AS "batchNumber",
      p.name AS "productName",
      pv.sku,
      ib.purchase_price::numeric AS "purchasePrice",
      ib.quantity_received::int AS "quantityReceived",
      ib.quantity_remaining::int AS "quantityRemaining",
      ib.manufactured_date AS "manufacturedDate",
      ib.expiry_date AS "expiryDate",
      CASE 
        WHEN ib.expiry_date IS NULL THEN 'no_expiry'
        WHEN ib.expiry_date < CURRENT_DATE THEN 'expired'
        WHEN ib.expiry_date < CURRENT_DATE + INTERVAL '30 days' THEN 'expiring_soon'
        ELSE 'valid'
      END AS "expiryStatus"
    FROM inventory_batches ib
    INNER JOIN product_variants pv ON pv.id = ib.variant_id
    INNER JOIN products p ON p.id = pv.product_id
    WHERE ib.quantity_remaining > 0
    ORDER BY ib.expiry_date ASC NULLS LAST
    LIMIT ${limit} OFFSET ${offset}
  `);

  return {
    data: listQuery.rows,
    total: Number(countQuery.rows[0]?.total || 0),
    page,
    limit,
  };
}

// ----------------------------------------------------
// 4. PURCHASE REPORTS
// ----------------------------------------------------

export async function getPurchaseSummaryReport(params: DateRangeQuery) {
  const { start, end } = getDateBounds(params);
  const page = params.page || 1;
  const limit = params.limit || 50;
  const offset = (page - 1) * limit;

  const countQuery = await db.execute(sql`
    SELECT COUNT(p.id)::int AS total
    FROM purchases p
    WHERE p.created_at >= ${start}::timestamp 
      AND p.created_at <= ${end}::timestamp
      ${params.supplierId ? sql`AND p.supplier_id = ${params.supplierId}` : sql``}
  `);

  const listQuery = await db.execute(sql`
    SELECT 
      p.id,
      p.purchase_order_number AS "purchaseOrderNumber",
      p.purchase_date AS "purchaseDate",
      p.created_at AS "createdAt",
      COALESCE(s.name, 'Unknown Supplier') AS "supplierName",
      p.total_amount::numeric AS "totalAmount",
      p.paid_amount::numeric AS "paidAmount",
      p.due_amount::numeric AS "dueAmount",
      p.status,
      p.payment_status AS "paymentStatus"
    FROM purchases p
    LEFT JOIN suppliers s ON s.id = p.supplier_id
    WHERE p.created_at >= ${start}::timestamp 
      AND p.created_at <= ${end}::timestamp
      ${params.supplierId ? sql`AND p.supplier_id = ${params.supplierId}` : sql``}
    ORDER BY p.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `);

  const totals = await db.execute(sql`
    SELECT 
      COUNT(p.id)::int AS "totalPurchases",
      COALESCE(SUM(p.total_amount), 0)::numeric AS "grandTotalAmount",
      COALESCE(SUM(p.paid_amount), 0)::numeric AS "grandPaidAmount",
      COALESCE(SUM(p.due_amount), 0)::numeric AS "grandDueAmount"
    FROM purchases p
    WHERE p.created_at >= ${start}::timestamp 
      AND p.created_at <= ${end}::timestamp
      ${params.supplierId ? sql`AND p.supplier_id = ${params.supplierId}` : sql``}
  `);

  return {
    data: listQuery.rows,
    total: Number(countQuery.rows[0]?.total || 0),
    totals: totals.rows[0] || {},
    page,
    limit,
  };
}

export async function getSupplierPayablesReport() {
  const result = await db.execute(sql`
    SELECT 
      s.id,
      s.name,
      s.phone,
      s.email,
      COUNT(p.id)::int AS "purchaseCount",
      COALESCE(SUM(p.total_amount), 0)::numeric AS "totalPurchased",
      COALESCE(SUM(p.paid_amount), 0)::numeric AS "totalPaid",
      COALESCE(SUM(p.due_amount), 0)::numeric AS "outstandingDue"
    FROM suppliers s
    INNER JOIN purchases p ON p.supplier_id = s.id
    WHERE p.payment_status IN ('unpaid', 'partial')
    GROUP BY s.id, s.name, s.phone, s.email
    HAVING SUM(p.due_amount) > 0
    ORDER BY "outstandingDue" DESC
  `);

  const totals = await db.execute(sql`
    SELECT 
      COUNT(DISTINCT s.id)::int AS "supplierCount",
      COALESCE(SUM(p.due_amount), 0)::numeric AS "totalPayable"
    FROM suppliers s
    INNER JOIN purchases p ON p.supplier_id = s.id
    WHERE p.payment_status IN ('unpaid', 'partial')
  `);

  return {
    suppliers: result.rows,
    totals: totals.rows[0] || {},
  };
}

