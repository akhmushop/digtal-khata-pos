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
    const insertSale = await pool.query(
      "INSERT INTO sales (discount,final_total,subtotal,vat,note) VALUES ($1,$2,$3,$4,$5) RETURNING id",
      [
        cashForm.discount,
        cashForm.final_total,
        cashForm.subtotal,
        cashForm.vat,
        cashForm.note,
      ],
    );
    const salesId = insertSale.rows[0].id;
    for (let item of cart) {
      const insertSoldProducts = await pool.query(
        "INSERT INTO sale_items (sale_id, product_id, sold_quantity, sold_price,product_name_at_sale,cost_at_sale) VALUES ($1,$2,$3,$4,$5,$6)",
        [
          salesId,
          item.id,
          item.sold_quantity,
          item.final_price,
          item.product_name,
          item.cost,
        ],
      );
      const updateProductQuantity = await pool.query(
        "UPDATE products SET quantity = quantity - $1 WHERE id = $2",
        [item.sold_quantity, item.id],
      );
    }
    console.log(cart, cashForm);
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
      totalSales,
      netProfit,
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
        "WITH sales_summary AS (SELECT COALESCE(SUM( CASE WHEN DATE_TRUNC('month' ,created_at) = DATE_TRUNC('month',CURRENT_DATE) THEN final_total ELSE 0 END),0) AS current_sales,COALESCE(SUM(CASE WHEN DATE_TRUNC('month' ,created_at) = DATE_TRUNC('month',CURRENT_DATE - INTERVAL '1 month')THEN final_total ELSE 0 END),0)AS prev_sales FROM  sales)SELECT current_sales,CASE WHEN prev_sales = 0 THEN 0 ELSE ROUND(((current_sales - prev_sales) / prev_sales) *100,2)END AS 	sales_growth FROM sales_summary",
      ),
      await pool.query(
        "WITH profit_summary AS(SELECT COALESCE(SUM(CASE WHEN DATE_TRUNC('month' ,s.created_at) = DATE_TRUNC('month',CURRENT_DATE)THEN si.sold_price - si.cost_at_sale ELSE 0 END),0) AS current_profit ,COALESCE(SUM(CASE WHEN DATE_TRUNC('month' ,s.created_at) = DATE_TRUNC('month',CURRENT_DATE - INTERVAL '1 month')THEN si.sold_price - si.cost_at_sale ELSE 0 END),0) AS prev_profit FROM sale_items si JOIN sales s ON si.sale_id = s.id)SELECT current_profit ,CASE WHEN prev_profit = 0 THEN 0 ELSE ROUND(((current_profit - prev_profit)/prev_profit)*100,2) END AS profit_growth FROM profit_summary",
      ),
    ]);

    res.json({
      salesOverview: salesOverview.rows,
      top_sold_products_by_category: top_sold_products_by_category.rows,
      profitByCategory: profitByCategory.rows,
      topItemsByGross: topItemsByGross.rows,
      productsSummary: productsSummary.rows,
      totalSales: totalSales.rows,
      netProfit: netProfit.rows,
    });
  } catch (err) {
    console.error(err);
  }
});

// router.get(
//   "/api/sold_products/sold_products_summery/top_sold_products_by_category",
//   async (req, res) => {
//     try {
//       const result = await pool.query("");
//       res.json(result.rows);
//     } catch (err) {
//       console.error(err);
//     }
//   },
// );
// WITH prev_monthly_summary AS (SELECT DATE_TRUNC('month',s.created_at) AS month, TO_CHAR(s.created_at,'Mon')
// AS month_name,
// SUM(si.sold_quantity) AS monthly_sold_items ,
// SUM(si.sold_quantity * si.sold_price) AS monthly_total_sales
// FROM sale_items si JOIN sales s ON si.sale_id = s.id
// GROUP BY DATE_TRUNC('month',s.created_at) ,TO_CHAR(s.created_at,'Mon')
// ORDER BY month),
// with_lag AS (SELECT month,month_name,monthly_sold_items,monthly_total_sales,LAG(monthly_sold_items) OVER(ORDER BY month)
// AS prev_monthly_sold_items
//  FROM prev_monthly_summary)
// SELECT month,month_name,monthly_sold_items ,monthly_total_sales,prev_monthly_sold_items ,ROUND(
// (monthly_sold_items - prev_monthly_sold_items) /NULLIF(prev_monthly_sold_items,0) * 100 ,2
// ) AS monthly_percentage_change FROM with_lag WHERE month = DATE_TRUNC('month', CURRENT_DATE -INTERVAL '1 month')

// SELECT p.category , COALESCE(SUM(si.sold_quantity),0) AS sold_items_by_category
// FROM products p
// LEFT JOIN (
// 	SELECT si.product_id , si.sold_quantity
// 	FROM sale_items si
// 	JOIN sales s ON si.sale_id = s.id
// 	WHERE DATE_TRUNC('month',s.created_at) = DATE_TRUNC('month', CURRENT_DATE -INTERVAL '1 month')
// 	) si ON si.product_id = p.id
// GROUP BY p.category
// ORDER BY sold_items_by_category DESC
// LIMIT 5

// SELECT p.category ,COALESCE(SUM((si.sold_price - si.cost_at_sale) * si.sold_quantity),0) AS profit_by_category
// FROM products p
// 	LEFT JOIN(
// 	SELECT si.product_id,si.sold_price,si.cost_at_sale,si.sold_quantity
// 	FROM sale_items si
// 	JOIN sales s ON  si.sale_id = s.id
// 	WHERE DATE_TRUNC('month',s.created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
// 	) si ON si.product_id = p.id
// GROUP BY p.category
// ORDER BY profit_by_category DESC
// LIMIT 5

// WITH current_month AS (
// 	SELECT p.category ,SUM((si.sold_price - si.cost_at_sale) * si.sold_quantity) AS current_profit
// 	FROM products p
// 	JOIN sale_items si ON si.product_id = p.id
// 	JOIN sales s ON  si.sale_id = s.id
// 	WHERE DATE_TRUNC('month',s.created_at) = DATE_TRUNC('month', CURRENT_DATE)
// 	GROUP BY p.category
// 	),
// last_month AS(
// 	SELECT p.category ,SUM((si.sold_price - si.cost_at_sale) * si.sold_quantity) AS last_profit
// 	FROM products p
// 	JOIN sale_items si ON si.product_id = p.id
// 	JOIN sales s ON  si.sale_id = s.id
// 	WHERE DATE_TRUNC('month',s.created_at) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
// 	GROUP BY p.category
// )
// SELECT COALESCE(c.category, l.category) AS category,
// COALESCE (c.current_profit, 0) AS current_month_profit,
// COALESCE (l.last_profit,0) AS last_month_profit,
// ROUND(

//   ((COALESCE(c.current_profit,0) - COALESCE(l.last_profit,0)) / NULLIF(COALESCE(l.last_profit,0),0)) * 100,2
// ) AS growth_percentage

// FROM current_month c FULL JOIN last_month l ON c.category = l.category
// ORDER BY current_month_profit DESC

export default router;
