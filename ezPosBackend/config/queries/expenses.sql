CREATE TABLE expense_categories(
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL
);
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK(amount >= 0),
    category_id INT REFERENCES expense_categories(id),
    payment_method VARCHAR(50) CHECK (
        payment_method IN ('cash', 'mobile', 'card')
    ),
    reference_no VARCHAR(100),
    note TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);