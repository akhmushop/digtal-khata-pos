CREATE TABLE suppliers (
    id BIGSERIAL PRIMARY KEY,
    supplier_code VARCHAR(30) UNIQUE,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(150),
    phone VARCHAR(30),
    email VARCHAR(150),
    company_name VARCHAR(150),
    address TEXT,
    opening_balance NUMERIC(12, 2) DEFAULT 0,
    opening_balance_type VARCHAR(10) CHECK (
        opening_balance_type IN ('payable', 'receivable')
    ),
    status BOOLEAN DEFAULT TRUE,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE supplier_ledger (
    id BIGSERIAL PRIMARY KEY,
    supplier_id BIGINT NOT NULL REFERENCES suppliers(id),
    transaction_type VARCHAR(30) NOT NULL,
    reference_id BIGINT,
    debit NUMERIC(12, 2) DEFAULT 0,
    credit NUMERIC(12, 2) DEFAULT 0,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Header for a purchase return event
CREATE TABLE purchase_returns (
    id SERIAL PRIMARY KEY,
    purchase_id INTEGER NOT NULL REFERENCES purchases(id),
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id),
    return_date TIMESTAMP NOT NULL DEFAULT now(),
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending/approved/completed
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    -- kept in sync by trigger
    created_at TIMESTAMP NOT NULL DEFAULT now()
);
-- Line items being returned
CREATE TABLE purchase_return_items (
    id SERIAL PRIMARY KEY,
    purchase_return_id INTEGER NOT NULL REFERENCES purchase_returns(id) ON DELETE CASCADE,
    purchase_item_id INTEGER NOT NULL REFERENCES purchase_items(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL,
    -- snapshot from purchase_item, not products table
    line_total NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);
SELECT pri.quantity AS return_quantity,
    pri.unit_price,
    pi.quantity AS purchase_quantity,
    pi.receive_quantity,
    pi.id,
    p.product_name,
    p.product_unit,
    p.price,
    p.cost
FROM purchase_return_items AS pri
    JOIN products AS p ON pri.product_id = p.id
    JOIN purchase_items AS pi ON pri.purchase_item_id = pi.id;
SELECT PRI.purchase_item_id,
    COALESCE(SUM(pri.quantity), 0) AS return_quantity
FROM purchase_return_items AS pri
    JOIN products AS p ON pri.product_id = p.id
    JOIN purchase_items AS pi ON pri.purchase_item_id = pi.id
GROUP BY PRI.purchase_item_id;
WITH RETURN_SUMMARY AS (
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
FROM RETURN_SUMMARY;