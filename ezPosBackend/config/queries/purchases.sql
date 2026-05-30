CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(255),
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount NUMERIC(10,2) NOT NULL DEFAULT 0,
    final_total NUMERIC(10,2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    due_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(20) NOT NULL DEFAULT 0,
    note TEXT,
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE purchase_items (
    id SERIAL PRIMARY KEY,

    purchase_id INT NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,

    product_id INT NOT NULL REFERENCES products(id),

    quantity NUMERIC(12,2) NOT NULL,
    cost_price NUMERIC(12,2) NOT NULL,

    total_cost NUMERIC(12,2) GENERATED ALWAYS AS (
        quantity * cost_price
    ) STORED
);