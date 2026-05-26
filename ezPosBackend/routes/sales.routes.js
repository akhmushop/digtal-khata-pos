import express from "express";
import { pool } from "../config/db.js";
const router = express.Router();
router.get("/api/sold_products", async (req, res) => {
  try {
    const sold_products = await pool.query(
      "SELECT s.id AS sale_id,si.id AS sale_items_id,p.id,p.product_name,p.category, p.cost, p.price ,si.sold_quantity, si.sold_price, s.created_at FROM sale_items si JOIN sales s ON si.sale_id = s.id JOIN products p ON si.product_id = p.id WHERE si.status = 'completed' AND s.status = 'completed'",
    );
    res.json(sold_products.rows);
  } catch (err) {
    console.error(err);
  }
});
router.post("/api/sold_products", async (req, res) => {
  try {
    const { cart, cashForm } = req.body;
    const {
      final_total,
      paid_amount,
      discount,
      subtotal,
      vat,
      note,
      payment_method,
      customer_id,
    } = cashForm;
    const due_amount = final_total - paid_amount;
    const getPaymentStatus = (paid, due) => {
      if (due <= 0) return "paid";
      if (paid > 0 && due > 0) return "partial";
      if (paid === 0) return "unpaid";
    };
    const payment_status = getPaymentStatus(paid_amount, due_amount);
    const insertSale = await pool.query(
      "INSERT INTO sales (customer_id, discount,final_total,subtotal,vat,note,payment_status,due_amount) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id",
      [
        customer_id,
        discount,
        final_total,
        subtotal,
        vat,
        note,
        payment_status,
        due_amount,
      ],
    );
    const salesId = insertSale.rows[0].id;
    if (paid_amount > 0) {
      await pool.query(
        "INSERT INTO sale_payments (customer_id,sale_id,paid_amount,payment_method) VALUES($1,$2,$3,$4)",
        [customer_id, salesId, paid_amount, payment_method],
      );
    }
    for (let item of cart) {
      const { id, sold_quantity, final_price, product_name, cost } = item;
      const insertSoldProducts = await pool.query(
        "INSERT INTO sale_items (sale_id, product_id, sold_quantity, sold_price,product_name_at_sale,cost_at_sale) VALUES ($1,$2,$3,$4,$5,$6)",
        [salesId, id, sold_quantity, final_price, product_name, cost],
      );
      const updateProductQuantity = await pool.query(
        "UPDATE products SET quantity = quantity - $1 WHERE id = $2",
        [sold_quantity, id],
      );
    }
  } catch (err) {
    console.error(err);
  }
});
router.post("/api/sold_products/refund/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateStatus = await pool.query(
      "UPDATE sale_items SET status = 'refunded' WHERE id = $1",
      [id],
    );
    const sale_items = await pool.query(
      "SELECT * FROM sale_items WHERE id = $1",
      [id],
    );
    const saleItem = sale_items.rows[0];
    const refundTotal = saleItem.sold_price * saleItem.sold_quantity;
    const refund = await pool.query(
      "INSERT INTO sale_refunds (sale_id ,refund_total) VALUES ($1,$2) RETURNING id",
      [saleItem.sale_id, refundTotal],
    );
    const saleRefundsId = refund.rows[0].id;
    await pool.query(
      "INSERT INTO sale_refund_items (refund_id ,sale_item_id,product_id,quantity,refund_price,refund_total) VALUES($1,$2,$3,$4,$5,$6)",
      [
        saleRefundsId,
        saleItem.id,
        saleItem.product_id,
        saleItem.sold_quantity,
        saleItem.sold_price,
        refundTotal,
      ],
    );
    const updateProductStock = await pool.query(
      "UPDATE products SET quantity =quantity + $1 WHERE id = $2",
      [saleItem.sold_quantity, saleItem.product_id],
    );
  } catch (err) {
    console.error(err);
  }
});
router.post("/api/sold_products/refunds_all/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const items = await pool.query(
      "SELECT * FROM sale_items WHERE sale_id=$1 AND status = 'completed'",
      [id],
    );
    const refundTotal = items.rows.reduce(
      (total, item) => total + item.sold_price * item.sold_quantity,
      0,
    );
    const saleRefundsId = await pool.query(
      "INSERT INTO sale_refunds (sale_id ,refund_total) VALUES ($1,$2) RETURNING id",
      [id, refundTotal],
    );
    for (let item of items.rows) {
      await pool.query(
        "INSERT INTO sale_refund_items (refund_id ,sale_item_id,product_id,quantity,refund_price,refund_total) VALUES($1,$2,$3,$4,$5,$6)",
        [
          saleRefundsId.rows[0].id,
          item.id,
          item.product_id,
          item.sold_quantity,
          item.sold_price,
          item.sold_price * item.sold_quantity,
        ],
      );
      await pool.query(
        "UPDATE products SET quantity =quantity + $1 WHERE id = $2",
        [item.sold_quantity, item.product_id],
      );
      await pool.query(
        "UPDATE sale_items SET status = 'refunded' WHERE sale_id  = $1",
        [item.sale_id],
      );
    }
    await pool.query("UPDATE sales SET status = 'refunded' WHERE id = $1", [
      id,
    ]);
  } catch (err) {
    console.error(err);
  }
});
router.get("/api/dashboard_summary", async (req, res) => {
  try {
    const [
      salesOverview,
      top_sold_products_by_category,
      profitByCategory,
      topItemsByGross,
      productsSummary,
      salesSummary,
      netProfit,
      invoiceDue,
      expensesSummary,
    ] = await Promise.all([
      await pool.query(
        "SELECT TO_CHAR(created_at,'Mon') AS month,COALESCE(SUM(final_total),0) AS sales ,COALESCE(SUM (CASE WHEN payment_status = 'paid' THEN final_total ELSE 0 END),0) AS cash FROM sales GROUP BY DATE_TRUNC('month',created_at),TO_CHAR(created_at,'Mon')ORDER BY DATE_TRUNC('month',created_at) LIMIT 12",
      ),
      await pool.query(
        "SELECT p.category , COALESCE(SUM(si.sold_quantity),0) AS sold_items_by_category FROM products p LEFT JOIN (SELECT si.product_id , si.sold_quantity FROM sale_items si JOIN sales s ON si.sale_id = s.id WHERE DATE_TRUNC('month',s.created_at) = DATE_TRUNC('month', CURRENT_DATE -INTERVAL '1 month')) si ON si.product_id = p.id GROUP BY p.category ORDER BY sold_items_by_category DESC LIMIT 5",
      ),
      await pool.query(
        "WITH current_month AS (SELECT p.category ,SUM((si.sold_price - si.cost_at_sale) * si.sold_quantity) AS current_profit FROM products p JOIN sale_items si ON si.product_id = p.id JOIN sales s ON  si.sale_id = s.id WHERE DATE_TRUNC('month',s.created_at) = DATE_TRUNC('month', CURRENT_DATE)GROUP BY p.category),last_month AS(SELECT p.category ,SUM((si.sold_price - si.cost_at_sale) * si.sold_quantity) AS last_profit FROM products p JOIN sale_items si ON si.product_id = p.id JOIN sales s ON  si.sale_id = s.id WHERE DATE_TRUNC('month',s.created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')GROUP BY p.category)SELECT COALESCE(c.category, l.category) AS category,COALESCE (c.current_profit, 0) AS current_month_profit,COALESCE (l.last_profit,0) AS last_month_profit,ROUND(((COALESCE(c.current_profit,0) - COALESCE(l.last_profit,0)) / NULLIF(COALESCE(l.last_profit,0),0)) * 100,2) AS growth_percentage FROM current_month c FULL JOIN last_month l ON c.category = l.category ORDER BY current_month_profit DESC LIMIT 5",
      ),
      await pool.query(
        "WITH current_month AS (SELECT p.product_name , SUM(si.sold_price * si.sold_quantity) AS current_gross FROM products p JOIN sale_items si ON si.product_id = p.id JOIN sales s ON si.sale_id = s.id WHERE DATE_TRUNC('month',s.created_at) = DATE_TRUNC('month',CURRENT_DATE)GROUP BY p.product_name ,DATE_TRUNC('month',s.created_at)),last_month AS (SELECT  p.product_name , SUM(si.sold_price * si.sold_quantity) AS last_gross FROM products p JOIN sale_items si ON si.product_id = p.id JOIN sales s ON si.sale_id = s.id WHERE DATE_TRUNC('month',s.created_at) = DATE_TRUNC('month',CURRENT_DATE -INTERVAL '1 month')GROUP BY p.product_name ,DATE_TRUNC('month',s.created_at))SELECT COALESCE(c.product_name,l.product_name) AS product_name ,COALESCE(c.current_gross,0) AS current_month_gross,COALESCE(l.last_gross,0) AS last_month_gross,CASE WHEN COALESCE(c.current_gross,0) > COALESCE(l.last_gross,0) THEN 'up' WHEN COALESCE(c.current_gross,0) < COALESCE(l.last_gross,0) THEN 'down' END AS trend FROM current_month c FULL JOIN last_month l ON c.product_name = l.product_name ORDER BY current_month_gross DESC LIMIT 5",
      ),
      await pool.query(
        "SELECT COUNT(*) FILTER(WHERE products.quantity >0 AND products.quantity <= products.alert_quantity) AS low_stock ,COUNT(*) FILTER(WHERE products.quantity <=0) AS stock_out ,SUM (products.quantity)  AS total_items,SUM (products.quantity * products.cost) AS total_valuation FROM products",
      ),
      await pool.query(
        "WITH sales_summary AS (SELECT COALESCE(SUM(CASE WHEN DATE_TRUNC('month' ,created_at) = DATE_TRUNC('month',CURRENT_DATE) THEN final_total ELSE 0 END),0)AS current_sales,COALESCE(SUM(CASE WHEN DATE_TRUNC('month' ,created_at) = DATE_TRUNC('month',CURRENT_DATE - INTERVAL '1 month')THEN final_total ELSE 0 END),0)AS prev_sales FROM sales),return_summary AS(SELECT COALESCE(SUM(CASE WHEN DATE_TRUNC('month' ,created_at) = DATE_TRUNC('month',CURRENT_DATE)THEN refund_total ELSE 0 END),0) AS current_return,COALESCE(SUM(CASE WHEN DATE_TRUNC('month' ,created_at) = DATE_TRUNC('month',CURRENT_DATE - INTERVAL '1 month')THEN refund_total ELSE 0 END),0) AS prev_return FROM sale_refunds)SELECT  ss.current_sales - rs.current_return AS current_net_sales,CASE WHEN (ss.prev_sales - rs.prev_return) = 0 THEN 0 ELSE ROUND(((ss.current_sales-rs.current_return) - (ss.prev_sales-rs.prev_return)) / (ss.prev_sales-rs.prev_return) *100,2)END AS sales_growth ,rs.current_return,CASE WHEN (ss.prev_sales - rs.prev_return) = 0 THEN 0 ELSE ROUND(((rs.current_return) - (rs.prev_return)) / (rs.prev_return) *100,2)END AS return_growth FROM sales_summary ss ,return_summary rs",
      ),
      await pool.query(
        `WITH PROFIT_SUMMARY AS (
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
      ),
      await pool.query(`WITH DUE AS (
    SELECT COALESCE(
            SUM(
                CASE
                    WHEN DATE_TRUNC('month', CREATED_AT) = DATE_TRUNC('month', CREATED_AT) THEN DUE_AMOUNT
                    ELSE 0
                END
            ),
            0
        ) AS CURRENT_DUE,
        COALESCE(
            SUM(
                CASE
                    WHEN DATE_TRUNC('month', CREATED_AT) = DATE_TRUNC('month', CREATED_AT - INTERVAL '1 month') THEN DUE_AMOUNT
                    ELSE 0
                END
            ),
            0
        ) AS PREV_DUE
    FROM SALES
)
SELECT CURRENT_DUE,
    CASE
        WHEN PREV_DUE = 0 THEN 0
        ELSE ROUND(((CURRENT_DUE - PREV_DUE) / PREV_DUE) * 100, 2)
    END AS DUE_GROWTH
FROM DUE`),
      await pool.query(`WITH EXPENSES_SUMMARY AS(
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
FROM EXPENSES_SUMMARY;`),
    ]);

    res.json({
      salesOverview: salesOverview.rows,
      top_sold_products_by_category: top_sold_products_by_category.rows,
      profitByCategory: profitByCategory.rows,
      topItemsByGross: topItemsByGross.rows,
      productsSummary: productsSummary.rows,
      salesSummary: salesSummary.rows,
      netProfit: netProfit.rows,
      invoiceDue: invoiceDue.rows,
      expensesSummary: expensesSummary.rows,
    });
  } catch (err) {
    console.error(err);
  }
});

export default router;
