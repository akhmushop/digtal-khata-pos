import { sql } from "drizzle-orm";
import { db } from "../../db/schema/index.js";

export const dashboardPeriods = [
  "today",
  "yesterday",
  "7d",
  "30d",
  "60d",
  "90d",
  "365d",
] as const;
export type DashboardPeriod = (typeof dashboardPeriods)[number];

function getPeriodDays(period: DashboardPeriod): number {
  if (period === "today" || period === "yesterday") return 1;
  return Number(period.slice(0, -1));
}

function getCurrentPeriodStart(period: DashboardPeriod) {
  const days = getPeriodDays(period);
  return sql`CASE
    WHEN ${period} = 'today' THEN CURRENT_DATE
    WHEN ${period} = 'yesterday' THEN CURRENT_DATE - INTERVAL '1 day'
    ELSE CURRENT_DATE - ((${days} - 1) * INTERVAL '1 day')
  END`;
}

function getCurrentPeriodEnd(period: DashboardPeriod) {
  return period === "yesterday"
    ? sql`CURRENT_DATE`
    : sql`CURRENT_DATE + INTERVAL '1 day'`;
}

function getPreviousPeriodStart(period: DashboardPeriod) {
  return sql`(${getCurrentPeriodStart(period)}) - (${getPeriodDays(period)} * INTERVAL '1 day')`;
}

export function getSalesOverview(period: DashboardPeriod) {
  const bucket =
    period === "today" || period === "yesterday"
      ? sql`DATE_TRUNC('hour', created_at)`
      : getPeriodDays(period) <= 30
        ? sql`DATE_TRUNC('day', created_at)`
        : getPeriodDays(period) <= 90
          ? sql`DATE_TRUNC('week', created_at)`
          : sql`DATE_TRUNC('month', created_at)`;
  const label =
    period === "today" || period === "yesterday"
      ? sql`'HH24:00'`
      : getPeriodDays(period) <= 30
        ? sql`'Dy DD'`
        : getPeriodDays(period) <= 90
          ? sql`'DD Mon'`
          : sql`'Mon YY'`;
  return db.execute(sql`
    SELECT
      TO_CHAR(${bucket}, ${label}) AS month,
      COALESCE(SUM(final_total), 0) AS sales,
      COALESCE(
        SUM(CASE WHEN payment_status = 'paid' THEN final_total ELSE 0 END),
        0
      ) AS cash
    FROM sales
    WHERE status IN ('completed', 'refunded')
      AND created_at >= ${getCurrentPeriodStart(period)}
      AND created_at < ${getCurrentPeriodEnd(period)}
    GROUP BY ${bucket}
    ORDER BY ${bucket}
  `);
}

export function getTopCategories(period: DashboardPeriod) {
  return db.execute(sql`
    SELECT
      COALESCE(c.name, 'Uncategorized') AS category,
      COALESCE(SUM(si.quantity), 0) AS sold_items_by_category
    FROM sale_items si
    INNER JOIN sales s ON s.id = si.sale_id
    INNER JOIN product_variants pv ON pv.id = si.variant_id
    INNER JOIN products p ON p.id = pv.product_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE s.status IN ('completed', 'refunded')
      AND s.created_at >= ${getCurrentPeriodStart(period)}
      AND s.created_at < ${getCurrentPeriodEnd(period)}
    GROUP BY c.name
    ORDER BY sold_items_by_category DESC
    LIMIT 5
  `);
}

export function getProfitByCategory(period: DashboardPeriod) {
  return db.execute(sql`
    SELECT
      COALESCE(c.name, 'Uncategorized') AS category,
      COALESCE(SUM((si.selling_price - si.cost_at_sale) * si.quantity), 0)
        AS current_month_profit
    FROM sale_items si
    INNER JOIN sales s ON s.id = si.sale_id
    INNER JOIN product_variants pv ON pv.id = si.variant_id
    INNER JOIN products p ON p.id = pv.product_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE s.status IN ('completed', 'refunded')
      AND s.created_at >= ${getCurrentPeriodStart(period)}
      AND s.created_at < ${getCurrentPeriodEnd(period)}
    GROUP BY c.name
    ORDER BY current_month_profit DESC
    LIMIT 5
  `);
}

export function getTopItemsByGross(period: DashboardPeriod) {
  return db.execute(sql`
    SELECT
      p.name AS product_name,
      COALESCE(SUM(
        CASE
          WHEN s.created_at >= ${getCurrentPeriodStart(period)}
            AND s.created_at < ${getCurrentPeriodEnd(period)}
          THEN si.line_total
          ELSE 0
        END
      ), 0) AS current_month_gross,
      COALESCE(SUM(
        CASE
          WHEN s.created_at >= ${getPreviousPeriodStart(period)}
            AND s.created_at < ${getCurrentPeriodStart(period)}
          THEN si.line_total
          ELSE 0
        END
      ), 0) AS last_month_gross,
      CASE
        WHEN SUM(
          CASE
            WHEN s.created_at >= ${getCurrentPeriodStart(period)}
              AND s.created_at < ${getCurrentPeriodEnd(period)}
            THEN si.line_total
            ELSE 0
          END
        ) > SUM(
          CASE
            WHEN s.created_at >= ${getPreviousPeriodStart(period)}
              AND s.created_at < ${getCurrentPeriodStart(period)}
            THEN si.line_total
            ELSE 0
          END
        ) THEN 'up'
        WHEN SUM(
          CASE
            WHEN s.created_at >= ${getCurrentPeriodStart(period)}
              AND s.created_at < ${getCurrentPeriodEnd(period)}
            THEN si.line_total
            ELSE 0
          END
        ) < SUM(
          CASE
            WHEN s.created_at >= ${getPreviousPeriodStart(period)}
              AND s.created_at < ${getCurrentPeriodStart(period)}
            THEN si.line_total
            ELSE 0
          END
        ) THEN 'down'
        ELSE 'steady'
      END AS trend
    FROM sale_items si
    INNER JOIN sales s ON s.id = si.sale_id
    INNER JOIN product_variants pv ON pv.id = si.variant_id
    INNER JOIN products p ON p.id = pv.product_id
    WHERE s.status IN ('completed', 'refunded')
      AND s.created_at >= ${getPreviousPeriodStart(period)}
      AND s.created_at < ${getCurrentPeriodEnd(period)}
    GROUP BY p.id, p.name
    ORDER BY current_month_gross DESC
    LIMIT 5
  `);
}

export function getProductsSummary() {
  return db.execute(sql`
    WITH stock_summary AS (
      SELECT
        COUNT(*) FILTER (
          WHERE COALESCE(stock.quantity, 0) > 0
            AND COALESCE(stock.quantity, 0) <= COALESCE(pv.alert_quantity, 0)
        ) AS low_stock,
        COUNT(*) FILTER (
          WHERE COALESCE(stock.quantity, 0) <= 0
        ) AS stock_out,
        COALESCE(SUM(COALESCE(stock.quantity, 0)), 0) AS total_items
      FROM product_variants pv
      LEFT JOIN inventory_stock stock ON stock.variant_id = pv.id
    ),
    stock_valuation AS (
      SELECT COALESCE(
        SUM(quantity_remaining * purchase_price),
        0
      ) AS total_valuation
      FROM inventory_batches
    )
    SELECT
      stock_summary.low_stock,
      stock_summary.stock_out,
      stock_summary.total_items,
      stock_valuation.total_valuation
    FROM stock_summary
    CROSS JOIN stock_valuation
  `);
}

export function getSalesSummary(period: DashboardPeriod) {
  return db.execute(sql`
    WITH period_sales AS (
      SELECT
        COALESCE(SUM(final_total) FILTER (
          WHERE created_at >= ${getCurrentPeriodStart(period)}
            AND created_at < ${getCurrentPeriodEnd(period)}
        ), 0) AS current_sales,
        COALESCE(SUM(final_total) FILTER (
          WHERE created_at >= ${getPreviousPeriodStart(period)}
            AND created_at < ${getCurrentPeriodStart(period)}
        ), 0) AS previous_sales
      FROM sales
      WHERE status IN ('completed', 'refunded')
    ),
    period_refunds AS (
      SELECT
        COALESCE(SUM(refund_total) FILTER (
          WHERE created_at >= ${getCurrentPeriodStart(period)}
            AND created_at < ${getCurrentPeriodEnd(period)}
        ), 0) AS current_return,
        COALESCE(SUM(refund_total) FILTER (
          WHERE created_at >= ${getPreviousPeriodStart(period)}
            AND created_at < ${getCurrentPeriodStart(period)}
        ), 0) AS previous_return
      FROM sale_refunds
    )
    SELECT
      current_sales - current_return AS current_net_sales,
      CASE
        WHEN previous_sales - previous_return = 0 THEN 0
        ELSE ROUND(
          ((current_sales - current_return) -
            (previous_sales - previous_return)) /
            (previous_sales - previous_return) * 100,
          2
        )
      END AS sales_growth,
      current_return,
      CASE
        WHEN previous_return = 0 THEN 0
        ELSE ROUND(
          (current_return - previous_return) / previous_return * 100,
          2
        )
      END AS return_growth
    FROM period_sales
    CROSS JOIN period_refunds
  `);
}

export function getSalesActivity(period: DashboardPeriod) {
  return db.execute(sql`
    SELECT
      COUNT(*) AS transaction_count,
      COALESCE(AVG(final_total), 0) AS average_sale
    FROM sales
    WHERE status IN ('completed', 'refunded')
      AND created_at >= ${getCurrentPeriodStart(period)}
      AND created_at < ${getCurrentPeriodEnd(period)}
  `);
}

export function getPaymentBreakdown(period: DashboardPeriod) {
  return db.execute(sql`
    SELECT
      payment_method AS method,
      COALESCE(SUM(amount), 0) AS amount,
      COUNT(*) AS payment_count
    FROM sale_payments
    WHERE payment_date >= ${getCurrentPeriodStart(period)}
      AND payment_date < ${getCurrentPeriodEnd(period)}
    GROUP BY payment_method
    ORDER BY amount DESC
  `);
}

export function getNetProfit(period: DashboardPeriod) {
  return db.execute(sql`
    WITH monthly_sales_profit AS (
      SELECT
        COALESCE(SUM(
          CASE
            WHEN s.created_at >= ${getCurrentPeriodStart(period)}
              AND s.created_at < ${getCurrentPeriodEnd(period)}
            THEN (si.selling_price - si.cost_at_sale) * si.quantity
            ELSE 0
          END
        ), 0) AS current_profit,
        COALESCE(SUM(
          CASE
            WHEN s.created_at >= ${getPreviousPeriodStart(period)}
              AND s.created_at < ${getCurrentPeriodStart(period)}
            THEN (si.selling_price - si.cost_at_sale) * si.quantity
            ELSE 0
          END
        ), 0) AS previous_profit
      FROM sale_items si
      INNER JOIN sales s ON s.id = si.sale_id
      WHERE s.status IN ('completed', 'refunded')
        AND s.created_at >= ${getPreviousPeriodStart(period)}
        AND s.created_at < ${getCurrentPeriodEnd(period)}
    ),
    monthly_refund_profit AS (
      SELECT
        COALESCE(SUM(
          CASE
            WHEN sr.created_at >= ${getCurrentPeriodStart(period)}
              AND sr.created_at < ${getCurrentPeriodEnd(period)}
            THEN (si.selling_price - si.cost_at_sale) * sri.quantity
            ELSE 0
          END
        ), 0) AS current_refund_profit,
        COALESCE(SUM(
          CASE
            WHEN sr.created_at >= ${getPreviousPeriodStart(period)}
              AND sr.created_at < ${getCurrentPeriodStart(period)}
            THEN (si.selling_price - si.cost_at_sale) * sri.quantity
            ELSE 0
          END
        ), 0) AS previous_refund_profit
      FROM sale_refunds sr
      INNER JOIN sale_refund_items sri ON sri.refund_id = sr.id
      INNER JOIN sale_items si ON si.id = sri.sale_item_id
      WHERE sr.created_at >= ${getPreviousPeriodStart(period)}
        AND sr.created_at < ${getCurrentPeriodEnd(period)}
    ),
    monthly_expenses AS (
      SELECT
        COALESCE(SUM(amount) FILTER (
          WHERE expense_date >= (${getCurrentPeriodStart(period)})::date
            AND expense_date < (${getCurrentPeriodEnd(period)})::date
        ), 0) AS current_expenses,
        COALESCE(SUM(amount) FILTER (
          WHERE expense_date >= (${getPreviousPeriodStart(period)})::date
            AND expense_date < (${getCurrentPeriodStart(period)})::date
        ), 0) AS previous_expenses
      FROM expenses
    ),
    net_profit AS (
      SELECT
        sales_profit.current_profit - refund_profit.current_refund_profit -
          expenses.current_expenses AS current_net_profit,
        sales_profit.previous_profit - refund_profit.previous_refund_profit -
          expenses.previous_expenses AS previous_net_profit
      FROM monthly_sales_profit sales_profit
      CROSS JOIN monthly_refund_profit refund_profit
      CROSS JOIN monthly_expenses expenses
    )
    SELECT
      current_net_profit,
      CASE
        WHEN previous_net_profit = 0 THEN NULL
        ELSE ROUND(
          (current_net_profit - previous_net_profit) / previous_net_profit * 100,
          2
        )
      END AS profit_growth
    FROM net_profit
  `);
}

export function getInvoiceDues() {
  return db.execute(sql`
    SELECT
      COALESCE(SUM(due_amount), 0) AS current_due,
      NULL::numeric AS invoice_due_growth_pct
    FROM sales
    WHERE status = 'completed'
      AND payment_status IN ('unpaid', 'partial')
  `);
}

export function getExpensesSummary(period: DashboardPeriod) {
  return db.execute(sql`
    WITH monthly_expenses AS (
      SELECT
        COALESCE(SUM(amount) FILTER (
          WHERE expense_date >= (${getCurrentPeriodStart(period)})::date
            AND expense_date < (${getCurrentPeriodEnd(period)})::date
        ), 0) AS current_expenses,
        COALESCE(SUM(amount) FILTER (
          WHERE expense_date >= (${getPreviousPeriodStart(period)})::date
            AND expense_date < (${getCurrentPeriodStart(period)})::date
        ), 0) AS previous_expenses
      FROM expenses
    )
    SELECT
      current_expenses,
      CASE
        WHEN previous_expenses = 0 THEN NULL
        ELSE ROUND(
          (current_expenses - previous_expenses) / previous_expenses * 100,
          2
        )
      END AS expenses_growth
    FROM monthly_expenses
  `);
}

export function getPurchasesSummary(period: DashboardPeriod) {
  return db.execute(sql`
    WITH monthly_purchases AS (
      SELECT
        COALESCE(SUM(total_amount) FILTER (
          WHERE created_at >= ${getCurrentPeriodStart(period)}
            AND created_at < ${getCurrentPeriodEnd(period)}
        ), 0) AS current_purchases,
        COALESCE(SUM(total_amount) FILTER (
          WHERE created_at >= ${getPreviousPeriodStart(period)}
            AND created_at < ${getCurrentPeriodStart(period)}
        ), 0) AS previous_purchases
      FROM purchases
    )
    SELECT
      current_purchases,
      CASE
        WHEN previous_purchases = 0 THEN NULL
        ELSE ROUND(
          (current_purchases - previous_purchases) / previous_purchases * 100,
          2
        )
      END AS purchases_growth
    FROM monthly_purchases
  `);
}

export function getReturnSummary(period: DashboardPeriod) {
  return db.execute(sql`
    WITH monthly_returns AS (
      SELECT
        COALESCE(SUM(total_amount) FILTER (
          WHERE created_at >= ${getCurrentPeriodStart(period)}
            AND created_at < ${getCurrentPeriodEnd(period)}
        ), 0) AS current_returns,
        COALESCE(SUM(total_amount) FILTER (
          WHERE created_at >= ${getPreviousPeriodStart(period)}
            AND created_at < ${getCurrentPeriodStart(period)}
        ), 0) AS previous_returns
      FROM purchase_returns
    )
    SELECT
      current_returns,
      CASE
        WHEN previous_returns = 0 AND current_returns = 0 THEN 0
        WHEN previous_returns = 0 THEN NULL
        ELSE ROUND(
          (current_returns - previous_returns) / previous_returns * 100,
          2
        )
      END AS return_growth_pct
    FROM monthly_returns
  `);
}

export function getRecentSalesSummary(period: DashboardPeriod) {
  return db.execute(sql`
    SELECT
      s.id,
      s.invoice_number,
      s.created_at,
      COALESCE(c.name, 'Walk-in customer') AS customer_name,
      s.final_total AS sold_price,
      s.payment_status,
      COUNT(si.id) AS item_count
    FROM sales s
    LEFT JOIN customers c ON c.id = s.customer_id
    LEFT JOIN sale_items si ON si.sale_id = s.id
    WHERE s.status = 'completed'
      AND s.created_at >= ${getCurrentPeriodStart(period)}
      AND s.created_at < ${getCurrentPeriodEnd(period)}
    GROUP BY s.id, s.invoice_number, s.created_at, c.name, s.final_total, s.payment_status
    ORDER BY s.created_at DESC
    LIMIT 5
  `);
}

export function getLowStockSummary() {
  return db.execute(sql`
    SELECT
      pv.id,
      p.name AS product_name,
      pv.sku,
      COALESCE(p.status, 'active') AS status,
      COALESCE(stock.quantity, 0) AS quantity
    FROM product_variants pv
    INNER JOIN products p ON p.id = pv.product_id
    LEFT JOIN inventory_stock stock ON stock.variant_id = pv.id
    WHERE COALESCE(stock.quantity, 0) <= COALESCE(pv.alert_quantity, 0)
    ORDER BY COALESCE(stock.quantity, 0) ASC
    LIMIT 5
  `);
}

export function getStaleStockSummary(staleDays: number, staleLimit: number) {
  return db.execute(sql`
    WITH last_sold AS (
      SELECT
        si.variant_id,
        MAX(s.created_at) AS last_sold_at
      FROM sale_items si
      INNER JOIN sales s ON s.id = si.sale_id
      WHERE s.status = 'completed'
      GROUP BY si.variant_id
    ),
    stock_value AS (
      SELECT
        variant_id,
        SUM(quantity_remaining * purchase_price) AS value
      FROM inventory_batches
      GROUP BY variant_id
    )
    SELECT
      pv.id,
      p.name AS product_name,
      pv.sku,
      stock.quantity,
      last_sold.last_sold_at,
      CASE
        WHEN last_sold.last_sold_at IS NULL THEN NULL
        ELSE GREATEST(
          FLOOR(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - last_sold.last_sold_at)) / 86400),
          0
        )::integer
      END AS days_since_last_sale,
      COALESCE(stock_value.value, 0) AS stock_value
    FROM product_variants pv
    INNER JOIN products p ON p.id = pv.product_id
    INNER JOIN inventory_stock stock ON stock.variant_id = pv.id
    LEFT JOIN last_sold ON last_sold.variant_id = pv.id
    LEFT JOIN stock_value ON stock_value.variant_id = pv.id
    WHERE stock.quantity > 0
      AND (
        last_sold.last_sold_at IS NULL
        OR last_sold.last_sold_at < CURRENT_TIMESTAMP - (${staleDays} * INTERVAL '1 day')
      )
    ORDER BY last_sold.last_sold_at ASC NULLS FIRST, stock.quantity DESC
    LIMIT ${staleLimit}
  `);
}

export function getTopSellingProducts(period: DashboardPeriod) {
  return db.execute(sql`
    SELECT
      p.id,
      p.name AS product_name,
      COALESCE(SUM(si.quantity), 0) AS top_selling,
      COALESCE(SUM(si.line_total), 0) AS gross_sales,
      COALESCE(
        SUM(si.selling_price * si.quantity) / NULLIF(SUM(si.quantity), 0),
        0
      ) AS sold_price
    FROM sale_items si
    INNER JOIN sales s ON s.id = si.sale_id
    INNER JOIN product_variants pv ON pv.id = si.variant_id
    INNER JOIN products p ON p.id = pv.product_id
    WHERE s.status IN ('completed', 'refunded')
      AND s.created_at >= ${getCurrentPeriodStart(period)}
      AND s.created_at < ${getCurrentPeriodEnd(period)}
    GROUP BY p.id, p.name
    ORDER BY top_selling DESC
    LIMIT 5
  `);
}
