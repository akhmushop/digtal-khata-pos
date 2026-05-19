--Total Sales
WITH SALES_SUMMARY AS (
    SELECT COALESCE(
            SUM(
                CASE
                    WHEN DATE_TRUNC('month', CREATED_AT) = DATE_TRUNC('month', CURRENT_DATE) THEN FINAL_TOTAL
                    ELSE 0
                END
            ),
            0
        ) AS CURRENT_SALES,
        COALESCE(
            SUM(
                CASE
                    WHEN DATE_TRUNC('month', CREATED_AT) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN FINAL_TOTAL
                    ELSE 0
                END
            ),
            0
        ) AS PREV_SALES
    FROM SALES
),
RETURN_SUMMARY AS (
    SELECT COALESCE(
            SUM(
                CASE
                    WHEN DATE_TRUNC('month', CREATED_AT) = DATE_TRUNC('month', CURRENT_DATE) THEN REFUND_TOTAL
                    ELSE 0
                END
            ),
            0
        ) AS CURRENT_RETURN,
        COALESCE(
            SUM(
                CASE
                    WHEN DATE_TRUNC('month', CREATED_AT) = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month') THEN REFUND_TOTAL
                    ELSE 0
                END
            ),
            0
        ) AS PREV_RETURN
    FROM SALE_REFUNDS
)
SELECT SS.CURRENT_SALES - RS.CURRENT_RETURN AS CURRENT_NET_SALES,
    CASE
        WHEN (SS.PREV_SALES - RS.PREV_RETURN) = 0 THEN 0
        ELSE ROUND(
            (
                (SS.CURRENT_SALES - RS.CURRENT_RETURN) - (SS.PREV_SALES - RS.PREV_RETURN)
            ) / (SS.PREV_SALES - RS.PREV_RETURN) * 100,
            2
        )
    END AS SALES_GROWTH,
    RS.CURRENT_RETURN,
    CASE
        WHEN (SS.PREV_SALES - RS.PREV_RETURN) = 0 THEN 0
        ELSE ROUND(
            ((RS.CURRENT_RETURN) - (RS.PREV_RETURN)) / (RS.PREV_RETURN) * 100,
            2
        )
    END AS CURRENT_GROWTH
FROM SALES_SUMMARY SS,
    RETURN_SUMMARY RS;
--NET PROFIT--
WITH PROFIT_SUMMARY AS (
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
)
SELECT PS.CURRENT_PROFIT - RS.CURRENT_REFUND_PROFIT AS CURRENT_NET_PROFIT,
    CASE
        WHEN PS.PREV_PROFIT - RS.PREV_REFUND_PROFIT = 0 THEN 0
        ELSE ROUND(
            (
                (
                    (PS.CURRENT_PROFIT - RS.CURRENT_REFUND_PROFIT) - (PS.PREV_PROFIT - RS.PREV_REFUND_PROFIT)
                ) / (PS.PREV_PROFIT - RS.PREV_REFUND_PROFIT)
            ) * 100,
            2
        )
    END AS PROFIT_GROWTH
FROM PROFIT_SUMMARY PS,
    REFUND_SUMMARY RS;
--Sales OverView	
SELECT TO_CHAR(CREATED_AT, 'Mon') AS MONTH,
    COALESCE(SUM(FINAL_TOTAL), 0) AS SALES,
    COALESCE(
        SUM(
            CASE
                WHEN PAYMENT_STATUS = 'paid' THEN FINAL_TOTAL
                ELSE 0
            END
        ),
        0
    ) AS CASH
FROM SALES
GROUP BY DATE_TRUNC('month', CREATED_AT),
    TO_CHAR(CREATED_AT, 'Mon')
ORDER BY DATE_TRUNC('month', CREATED_AT)
LIMIT 12;
-------CREATE TABLE-----
CREATE TABLE CUSTOMERS (
    ID SERIAL PRIMARY KEY,
    NAME VARCHAR(255) NOT NULL,
    PHONE VARCHAR (20),
    ADDRESS TEXT,
    CREATED_AT TIMESTAMP DEFAULT NOW()
);
--ADD COLUMN IN SALES TABLE--
ALTER TABLE SALES
ADD COLUMN CUSTOMER_ID INT REFERENCES CUSTOMERS(ID);
--CREATE SALE_PAYMENTS TABLE--
CREATE TABLE SALE_PAYMENTS (
    ID SERIAL PRIMARY KEY,
    SALE_ID INT REFERENCES SALES(ID),
    CUSTOMER_ID INT REFERENCES CUSTOMERS(ID),
    PAID_AMOUNT NUMERIC(10, 2),
    PAYMENT_METHOD VARCHAR(50),
    PAYMENT_DATE TIMESTAMP DEFAULT NOW(),
    NOTES TEXT
);
----invoice due-----
SELECT S.ID AS SALE_ID,
    C.NAME AS CUSTOMER_NAME,
    S.FINAL_TOTAL AS TOTAL_AMOUNT,
    COALESCE(SUM(SP.PAID_AMOUNT), 0) AS PAID_AMOUNT,
    S.FINAL_TOTAL - COALESCE(SUM(SP.PAID_AMOUNT), 0) AS DUE_AMOUNT
FROM sales s
    JOIN CUSTOMERS C ON S.CUSTOMER_ID = C.ID
    LEFT JOIN SALE_PAYMENTS SP ON SP.SALE_ID = S.ID
GROUP BY S.ID,
    C.NAME,
    S.FINAL_TOTAL
HAVING S.FINAL_TOTAL - COALESCE(SUM(SP.PAID_AMOUNT), 0) > 0
ORDER BY DUE_AMOUNT DESC;
---MONTHLY DUE AND PERCENTAGE---
WITH DUE AS (
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
FROM DUE