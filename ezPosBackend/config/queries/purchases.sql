CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(255),
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    final_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    due_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) NOT NULL DEFAULT 0,
    note TEXT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE purchase_items (
    id SERIAL PRIMARY KEY,
    purchase_id INT NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    quantity NUMERIC(12, 2) NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL,
    total_cost NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * cost_price) STORED
);
ALTER TABLE purchases
ALTER COLUMN payment_status DROP DEFAULT;
ALTER TABLE purchases
ALTER COLUMN payment_status
SET DEFAULT 'unpaid';
SELECT conname
FROM pg_constraint
WHERE conrelid = 'purchase_items'::regclass;
ALTER TABLE purchase_items DROP CONSTRAINT purchase_items_purchase_id_fkey
ALTER TABLE purchase_items
ADD CONSTRAINT purchase_items_purchase_id_fkey FOREIGN KEY (purchase_id) REFERENCES purchases(id);
ALTER TABLE purchases
    RENAME COLUMN create_at TO CREATED_AT;
WITH PURCHASES_SUMMARY AS (
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
            (CURRENT_PURCHASES - PREV_PURCHASES) / NULLIF(PREV_PURCHASES, 0)
        ) * 100,
        2
    ) AS PURCHASES_GROWTH
FROM PURCHASES_SUMMARY;
SELECT PI.*,
    P.product_name,
    p.product_unit,
    P.PRICE
FROM purchase_items PI
    JOIN products P ON PI.product_id = P.id;
UPDATE purchases
SET paid_amount = $1,
    due_amount = $2,
    payment_status = CASE
        WHEN ($1::numeric) <= 0 THEN 'unpaid'
        WHEN ($1::numeric) < final_total THEN 'partial_paid'
        ELSE 'paid'
    END
WHERE ID = $3;
ALTER TABLE purchases ADD COLUMN status  VARCHAR(20) NOT NULL DEFAULT 'ordered';