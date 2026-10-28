INSERT INTO "expense_categories" ("category_name")
VALUES
	('Electricity'),
	('Internet'),
	('Salary'),
	('Transport'),
	('Maintenance')
ON CONFLICT ("category_name") DO NOTHING;
