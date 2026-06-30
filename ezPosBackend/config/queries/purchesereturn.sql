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