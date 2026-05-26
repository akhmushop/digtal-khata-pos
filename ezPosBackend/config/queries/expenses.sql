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
INSERT INTO expense_categories (category_name)
VALUES ('Electricity'),
    ('Internet'),
    ('Salary'),
    ('Transport'),
    ('Maintenance');
WITH EXPENSES_SUMMARY AS(
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
        (
            (
                COALESCE(CURRENT_EXPENSES, 0) - COALESCE(PREV_EXPENSES, 0)
            ) / NULLIF(PREV_EXPENSES, 0)
        ) * 100,
        2
    ) AS EXPENSES_GROWTH
FROM EXPENSES_SUMMARY;