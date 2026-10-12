import { and, asc, desc, eq, gt, gte, lt, sql } from "drizzle-orm";
import { db } from "../../db/schema/index.js";
import { sales } from "../../db/schema/sales.js";
import { saleItems } from "../../db/schema/saleItems.js";
import { products } from "../../db/schema/products.js";

export function getSalesOverview() {
  return db
    .select({
      month: sql<string>`TO_CHAR(${sales.createdAt},'Mon')`,
      sales: sql<number>`COALESCE(SUM(${sales.finalTotal}),0)`,
      cash: sql<number>`COALESCE(SUM(CASE WHEN ${sales.paymentStatus} = 'paid' THEN ${sales.finalTotal} ELSE 0 END),0)`,
    })
    .from(sales)
    .groupBy(
      sql`DATE_TRUNC('month',${sales.createdAt})`,
      sql`TO_CHAR(${sales.createdAt},'Mon')`,
    )
    .orderBy(sql`DATE_TRUNC('month',${sales.createdAt})`)
    .limit(12);
}
export function getTopCategories() {
  const lastMonthSales = db
    .select({
      productId: saleItems.productId,
      soldQuantity: saleItems.soldQuantity,
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .where(
      sql`DATE_TRUNC('month', ${sales.createdAt}) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')`,
    )
    .as("last_month_sales");
  return db
    .select({
      category: products.category,
      soldItemsByCategory: sql<number>`COALESCE(SUM(${lastMonthSales.soldQuantity}), 0)`,
    })
    .from(products)
    .leftJoin(lastMonthSales, eq(lastMonthSales.productId, products.id))
    .groupBy(products.category)
    .orderBy(desc(sql`COALESCE(SUM(${lastMonthSales.soldQuantity}), 0)`))
    .limit(5);
}
export function getProfitByCategory() {
  const currentMonthCte = db.$with("current_month").as(
    db
      .select({
        category: products.category,
        currentProfit: sql<number>`SUM(
                    (${saleItems.soldPrice} - ${saleItems.costAtSale}) * ${saleItems.soldQuantity}
                )`.as("current_profit"),
      })
      .from(products)
      .innerJoin(saleItems, eq(saleItems.productId, products.id))
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .where(
        sql`DATE_TRUNC('month', ${sales.createdAt}) = DATE_TRUNC('month', CURRENT_DATE)`,
      )
      .groupBy(products.category),
  );
  const lastMonthCte = db.$with("last_month").as(
    db
      .select({
        category: products.category,
        lastProfit: sql<number>`SUM(
                    (${saleItems.soldPrice} - ${saleItems.costAtSale}) * ${saleItems.soldQuantity}
                )`.as("last_profit"),
      })
      .from(products)
      .innerJoin(saleItems, eq(saleItems.productId, products.id))
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .where(
        sql`DATE_TRUNC('month', ${sales.createdAt}) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')`,
      )
      .groupBy(products.category),
  );
  return db
    .with(currentMonthCte, lastMonthCte)
    .select({
      category: sql`COALESCE(${currentMonthCte.category},${lastMonthCte.category})`,
      currentMonthProfit: sql<number>`COALESCE(${currentMonthCte.currentProfit},0)`,
      lastMonthProfit: sql<number>`COALESCE(${lastMonthCte.lastProfit},0)`,
      growthPercentage: sql<number>`ROUND(
            (
                (
                    COALESCE(${currentMonthCte.currentProfit}, 0) - COALESCE(${lastMonthCte.lastProfit}, 0)
                ) / NULLIF(COALESCE(${lastMonthCte.lastProfit}, 0), 0)
            ) * 100,
            2
        )`,
    })
    .from(currentMonthCte)
    .fullJoin(lastMonthCte, eq(currentMonthCte.category, lastMonthCte.category))
    .orderBy(desc(sql`COALESCE(${currentMonthCte.currentProfit},0)`))
    .limit(5);
}
export function getTopItemsByGross() {
  const currentMonthGrossCte = db.$with("current_month").as(
    db
      .select({
        productName: products.productName,
        currentGross:
          sql<number>`SUM(${saleItems.soldPrice} * ${saleItems.soldQuantity})`.as(
            "current_gross",
          ),
      })
      .from(products)
      .innerJoin(saleItems, eq(saleItems.productId, products.id))
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .where(
        sql`DATE_TRUNC('month', ${sales.createdAt}) = DATE_TRUNC('month', CURRENT_DATE)`,
      )
      .groupBy(
        products.productName,
        sql`DATE_TRUNC('month', ${sales.createdAt})`,
      ),
  );
  const lastMonthGrossCte = db.$with("last_month").as(
    db
      .select({
        productName: products.productName,
        lastGross:
          sql<number>`SUM(${saleItems.soldPrice} * ${saleItems.soldQuantity})`.as(
            "last_gross",
          ),
      })
      .from(products)
      .innerJoin(saleItems, eq(saleItems.productId, products.id))
      .innerJoin(sales, eq(saleItems.saleId, sales.id))
      .where(
        sql`DATE_TRUNC('month', ${sales.createdAt}) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')`,
      )
      .groupBy(
        products.productName,
        sql`DATE_TRUNC('month', ${sales.createdAt})`,
      ),
  );
  return db
    .with(currentMonthGrossCte, lastMonthGrossCte)
    .select({
      productName:
        sql<string>`COALESCE(${currentMonthGrossCte.productName}, ${lastMonthGrossCte.productName})`.as(
          "product_name",
        ),
      currentMonthGross:
        sql<number>`COALESCE(${currentMonthGrossCte.currentGross}, 0)`.as(
          "current_month_gross",
        ),
      lastMonthGross:
        sql<number>`COALESCE(${lastMonthGrossCte.lastGross}, 0)`.as(
          "last_month_gross",
        ),
      trend: sql`CASE
                        WHEN COALESCE(${currentMonthGrossCte.currentGross}, 0) > COALESCE(${lastMonthGrossCte.lastGross}, 0) THEN 'up'
                        WHEN COALESCE(${currentMonthGrossCte.currentGross}, 0) < COALESCE(${lastMonthGrossCte.lastGross}, 0) THEN 'down'
                    END `.as("trend"),
    })
    .from(currentMonthGrossCte)
    .fullJoin(
      lastMonthGrossCte,
      eq(currentMonthGrossCte.productName, lastMonthGrossCte.productName),
    )
    .orderBy(desc(sql`COALESCE(${currentMonthGrossCte.currentGross}, 0)`))
    .limit(5);
}
export function getProductsSummary() {
  return db
    .select({
      lowStock:
        sql<number>`COUNT(*) FILTER(WHERE ${products.quantity} >0 AND ${products.quantity} <= ${products.alertQuantity})`.as(
          "low_stock",
        ),
      stockOut: sql<number>`COUNT(*) FILTER(WHERE ${products.quantity} =0)`.as(
        "stock_out",
      ),
      totalItems: sql<number>`SUM (${products.quantity})`.as("total_items"),
      totalValuation:
        sql<number>`SUM (${products.quantity} * ${products.cost})`.as(
          "total_valuation",
        ),
    })
    .from(products);
}
export function getSalesSummary() {
  return db.execute(
    sql`WITH sales_summary AS (SELECT COALESCE(SUM(CASE WHEN DATE_TRUNC('month' ,created_at) = DATE_TRUNC('month',CURRENT_DATE) THEN final_total ELSE 0 END),0)AS current_sales,COALESCE(SUM(CASE WHEN DATE_TRUNC('month' ,created_at) = DATE_TRUNC('month',CURRENT_DATE - INTERVAL '1 month')THEN final_total ELSE 0 END),0)AS prev_sales FROM sales),return_summary AS(SELECT COALESCE(SUM(CASE WHEN DATE_TRUNC('month' ,created_at) = DATE_TRUNC('month',CURRENT_DATE)THEN refund_total ELSE 0 END),0) AS current_return,COALESCE(SUM(CASE WHEN DATE_TRUNC('month' ,created_at) = DATE_TRUNC('month',CURRENT_DATE - INTERVAL '1 month')THEN refund_total ELSE 0 END),0) AS prev_return FROM sale_refunds)SELECT  ss.current_sales - rs.current_return AS current_net_sales,CASE WHEN (ss.prev_sales - rs.prev_return) = 0 THEN 0 ELSE ROUND(((ss.current_sales-rs.current_return) - (ss.prev_sales-rs.prev_return)) / (ss.prev_sales-rs.prev_return) *100,2)END AS sales_growth ,rs.current_return,CASE WHEN rs.prev_return = 0 THEN 0 ELSE ROUND(((rs.current_return) - (rs.prev_return)) / (rs.prev_return) *100,2)END AS return_growth FROM sales_summary ss ,return_summary rs`,
  );
}
export function getNetProfit() {
  return db.execute(
    sql`WITH PROFIT_SUMMARY AS (
    SELECT COALESCE(
            SUM(
                CASE
                    WHEN DATE_TRUNC('month', S.CREATED_AT) = DATE_TRUNC('month', CURRENT_DATE) THEN (SI.SOLD_PRICE - SI.COST_AT_SALE) * SI.SOLD_QUANTITY
                    ELSE 0
                END
            ),
            0
        ) AS CURRENT_PROFIT,
        COALESCE(
            SUM(
                CASE
                    WHEN DATE_TRUNC('month', S.CREATED_AT) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN (SI.SOLD_PRICE - SI.COST_AT_SALE) * SI.SOLD_QUANTITY
                    ELSE 0
                END
            ),
            0
        ) AS PREV_PROFIT
    FROM SALE_ITEMS SI
        JOIN SALES S ON SI.SALE_ID = S.ID
),
REFUND_SUMMARY AS (
    SELECT COALESCE(
            SUM(
                CASE
                    WHEN DATE_TRUNC('month', SR.CREATED_AT) = DATE_TRUNC('month', CURRENT_DATE) THEN (SI.SOLD_PRICE - SI.COST_AT_SALE) * SI.SOLD_QUANTITY
                    ELSE 0
                END
            ),
            0
        ) AS CURRENT_REFUND_PROFIT,
        COALESCE(
            SUM(
                CASE
                    WHEN DATE_TRUNC('month', SR.CREATED_AT) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN (SI.SOLD_PRICE - SI.COST_AT_SALE) * SI.SOLD_QUANTITY
                    ELSE 0
                END
            ),
            0
        ) AS PREV_REFUND_PROFIT
    FROM SALE_REFUNDS SR
        JOIN SALE_REFUND_ITEMS SRI ON SRI.REFUND_ID = SR.ID
        JOIN SALE_ITEMS SI ON SRI.SALE_ITEM_ID = SI.ID
),
EXPENSES_SUMMARY AS (
    SELECT COALESCE(SUM(amount) FILTER (
            WHERE DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE)
        ),0) AS CURRENT_EXPENSES,
        COALESCE(SUM(amount) FILTER(
            WHERE DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
        ),0) AS PREV_EXPENSES
    FROM expenses
),
NET_SUMMARY AS(
    SELECT (
            PS.CURRENT_PROFIT - RS.CURRENT_REFUND_PROFIT - ES.CURRENT_EXPENSES
        ) AS CURRENT_NET_PROFIT,
        (
            PS.PREV_PROFIT - RS.PREV_REFUND_PROFIT - ES.PREV_EXPENSES
        ) AS PREV_NET_PROFIT
    FROM PROFIT_SUMMARY PS
        CROSS JOIN REFUND_SUMMARY RS
        CROSS JOIN EXPENSES_SUMMARY ES
)
SELECT CURRENT_NET_PROFIT,
    ROUND(
        (
            (CURRENT_NET_PROFIT - PREV_NET_PROFIT) / NULLIF(PREV_NET_PROFIT, 0)
        ) * 100,
        2
    ) AS PROFIT_GROWTH
FROM NET_SUMMARY;`,
  );
}
export function getInvoiceDues() {
  return db.execute(sql`WITH INVOICE_DUE AS (
    SELECT COALESCE(
            SUM(DUE_AMOUNT) FILTER (
                WHERE created_at >= DATE_TRUNC('MONTH', CURRENT_DATE)
                    AND created_at < DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '1 MONTH'
            ),
            0
        ) AS CURRENT_INVOICE_DUE,
        COALESCE(
            SUM(DUE_AMOUNT) FILTER (
                WHERE created_at >= DATE_TRUNC('MONTH', CURRENT_DATE - INTERVAL '1 MONTH')
                    AND created_at < DATE_TRUNC('MONTH', CURRENT_DATE)
            ),
            0
        ) AS PREV_INVOICE_DUE,
        COALESCE(
            SUM(PAID_AMOUNT) FILTER (
                WHERE created_at >= DATE_TRUNC('MONTH', CURRENT_DATE)
                    AND created_at < DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '1 MONTH'
            ),
            0
        ) AS CURRENT_PAID,
        COALESCE(
            SUM(PAID_AMOUNT) FILTER (
                WHERE created_at >= DATE_TRUNC('MONTH', CURRENT_DATE - INTERVAL '1 MONTH')
                    AND created_at < DATE_TRUNC('MONTH', CURRENT_DATE)
            ),
            0
        ) AS PREV_PAID
    FROM PURCHASES
    WHERE created_at >= DATE_TRUNC('MONTH', CURRENT_DATE - INTERVAL '1 MONTH')
        AND created_at < DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '1 MONTH'
        AND PAYMENT_STATUS IN ('unpaid', 'partial')
)
SELECT CURRENT_INVOICE_DUE - CURRENT_PAID AS CURRENT_DUE,
    CASE
        WHEN (PREV_INVOICE_DUE - PREV_PAID) = 0 THEN NULL
        ELSE ROUND(
            (
                (
                    (CURRENT_INVOICE_DUE - CURRENT_PAID) - (PREV_INVOICE_DUE - PREV_PAID)
                )::NUMERIC / (PREV_INVOICE_DUE - PREV_PAID)::NUMERIC
            ) * 100,
            2
        )
    END AS INVOICE_DUE_GROWTH_PCT
FROM INVOICE_DUE;`);
}
export function getExpensesSummary() {
  return db.execute(sql`WITH EXPENSES_SUMMARY AS(
    SELECT SUM(amount) FILTER (
            WHERE DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE)
        ) AS CURRENT_EXPENSES,
        SUM(
            CASE
                WHEN DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN amount
            END
        ) AS PREV_EXPENSES
    FROM expenses
)
SELECT COALESCE(CURRENT_EXPENSES, 0) AS CURRENT_EXPENSES,
    ROUND(
        CASE
            WHEN COALESCE(PREV_EXPENSES, 0) = 0 THEN NULL
            ELSE (
                (
                    COALESCE(CURRENT_EXPENSES, 0) - COALESCE(PREV_EXPENSES, 0)
                ) / NULLIF(PREV_EXPENSES, 0)
            ) * 100
        END,
        2
    ) AS EXPENSES_GROWTH
FROM EXPENSES_SUMMARY;`);
}
export function getPurchasesSummary() {
  return db.execute(sql`WITH PURCHASES_SUMMARY AS (
    SELECT COALESCE(
            SUM(final_total) FILTER(
                WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
            ),
            0
        ) AS CURRENT_PURCHASES,
        COALESCE(
            SUM(final_total) FILTER(
                WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
            ),
            0
        ) AS PREV_PURCHASES
    FROM purchases
)
SELECT CURRENT_PURCHASES,
    ROUND(
        (
            (CURRENT_PURCHASES - PREV_PURCHASES) / NULLIF(PREV_PURCHASES,0)
        ) * 100,
        2
    ) AS PURCHASES_GROWTH
FROM PURCHASES_SUMMARY;`);
}
export function getReturnSummary() {
  return db.execute(sql`WITH RETURN_SUMMARY AS (
    SELECT COALESCE(
            SUM(total_amount) FILTER (
                WHERE created_at >= DATE_TRUNC('MONTH', CURRENT_DATE)
                    AND created_at < DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '1 MONTH'
            ),
            0
        ) AS CURRENT_RETURNS,
        COALESCE(
            SUM(total_amount) FILTER (
                WHERE created_at >= DATE_TRUNC('MONTH', CURRENT_DATE - INTERVAL '1 MONTH')
                    AND created_at < DATE_TRUNC('MONTH', CURRENT_DATE)
            ),
            0
        ) AS PREV_RETURNS
    FROM purchase_returns
    WHERE created_at >= DATE_TRUNC('MONTH', CURRENT_DATE - INTERVAL '1 MONTH')
        AND created_at < DATE_TRUNC('MONTH', CURRENT_DATE) + INTERVAL '1 MONTH'
)
SELECT CURRENT_RETURNS,
    CASE
        WHEN PREV_RETURNS = 0
        AND CURRENT_RETURNS = 0 THEN 0
        WHEN PREV_RETURNS = 0 THEN NULL
        ELSE ROUND(
            ((CURRENT_RETURNS - PREV_RETURNS) / PREV_RETURNS) * 100,
            2
        )
    END AS RETURN_GROWTH_PCT
FROM RETURN_SUMMARY;`);
}
export function getRecentSalesSummary() {
  return db
    .select({
      image: products.image,
      id: saleItems.id,
      createdAt: sales.createdAt,
      productNameAtSale: saleItems.productNameAtSale,
      soldPrice: saleItems.soldPrice,
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .innerJoin(products, eq(saleItems.productId, products.id))
    .where(eq(saleItems.status, "completed"))
    .orderBy(desc(sales.createdAt))
    .limit(5);
}
export function getLowStockSummary() {
  return db
    .select({
      id: products.id,
      productName: products.productName,
      image: products.image,
      sku: products.sku,
      status: products.status,
      quantity: products.quantity,
    })
    .from(products)
    .where(
      and(
        gte(products.alertQuantity, products.quantity),
        gt(products.quantity, 0),
      ),
    )
    .orderBy(asc(products.quantity))
    .limit(5);
}
export function getTopSellingProducts() {
  return db
    .select({
      id: saleItems.id,
      productId: saleItems.productId,
      productName: products.productName,
      image: products.image,
      soldPrice: saleItems.soldPrice,
      topSelling: sql<number>`SUM(${saleItems.soldQuantity})`.as("top_selling"),
    })
    .from(saleItems)
    .innerJoin(sales, eq(saleItems.saleId, sales.id))
    .innerJoin(products, eq(saleItems.productId, products.id))
    .where(
      and(
        gte(
          sales.createdAt,
          sql`DATE_TRUNC('MONTH', CURRENT_DATE - INTERVAL '1 MONTH')`,
        ),
        lt(sales.createdAt, sql`DATE_TRUNC('MONTH', CURRENT_DATE)`),
        eq(saleItems.status, "completed"),
      ),
    )
    .groupBy(
      saleItems.productId,
      products.productName,
      products.image,
      saleItems.id,
    )
    .orderBy(desc(sql`SUM(${saleItems.soldQuantity})`))
    .limit(5);
}
