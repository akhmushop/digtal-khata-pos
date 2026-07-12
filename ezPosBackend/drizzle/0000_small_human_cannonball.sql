-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "sale_refunds" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" integer,
	"reason" text,
	"created_at" timestamp DEFAULT now(),
	"status" varchar(20),
	"refund_total" numeric
);
--> statement-breakpoint
CREATE TABLE "test" (
	"tags" jsonb
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"status" varchar(30) DEFAULT 'completed',
	"invoice_number" varchar(50),
	"sale_date" date DEFAULT CURRENT_DATE,
	"subtotal" numeric(10, 2),
	"discount" numeric(10, 2) DEFAULT '0',
	"vat" numeric(10, 2) DEFAULT '0',
	"final_total" numeric(10, 2),
	"payment_status" varchar(20) DEFAULT 'paid',
	"due_amount" numeric(10, 2) DEFAULT '0',
	"note" text,
	"customer_id" integer,
	CONSTRAINT "sales_invoice_number_key" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"supplier_name" varchar(255),
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"final_total" numeric(10, 2) DEFAULT '0' NOT NULL,
	"paid_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"due_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"payment_status" varchar(20) DEFAULT 'unpaid' NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"status" varchar(20) DEFAULT 'ordered' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supplier_ledger" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"supplier_id" bigint NOT NULL,
	"transaction_type" varchar(30) NOT NULL,
	"reference_id" bigint,
	"debit" numeric(12, 2) DEFAULT '0',
	"credit" numeric(12, 2) DEFAULT '0',
	"note" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "suppliers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"supplier_code" varchar(30),
	"name" varchar(150) NOT NULL,
	"contact_person" varchar(150),
	"phone" varchar(30),
	"email" varchar(150),
	"company_name" varchar(150),
	"address" text,
	"opening_balance" numeric(12, 2) DEFAULT '0',
	"opening_balance_type" varchar(10),
	"status" boolean DEFAULT true,
	"note" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "suppliers_supplier_code_key" UNIQUE("supplier_code"),
	CONSTRAINT "suppliers_opening_balance_type_check" CHECK ((opening_balance_type)::text = ANY ((ARRAY['payable'::character varying, 'receivable'::character varying])::text[]))
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"barcode" varchar(40),
	"product_name" varchar(100) NOT NULL,
	"product_unit" varchar(20),
	"product_type" varchar(20),
	"alert_quantity" integer NOT NULL,
	"cost" double precision NOT NULL,
	"price" double precision NOT NULL,
	"discount_percent" numeric DEFAULT '0',
	"flat_discount" numeric DEFAULT '0',
	"quantity" integer NOT NULL,
	"batch_number" varchar(200),
	"expiry_date" varchar(30),
	"description" varchar(200),
	"brand" varchar(30),
	"category" varchar(50),
	"supplier" varchar(50),
	"image" varchar(200),
	"status" varchar(30),
	"created_at" varchar(30) DEFAULT CURRENT_DATE,
	"sku" varchar(100),
	"weight" varchar(20),
	"dimensions" varchar(80),
	"variations" varchar(300),
	"final_price" numeric,
	"tags" jsonb,
	CONSTRAINT "products_barcode_key" UNIQUE("barcode")
);
--> statement-breakpoint
CREATE TABLE "sale_refund_items" (
	"id" serial NOT NULL,
	"refund_id" integer,
	"sale_item_id" integer,
	"product_id" integer,
	"quantity" integer,
	"refund_price" numeric,
	"refund_total" numeric,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20),
	"address" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expense_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_name" varchar(100) NOT NULL,
	CONSTRAINT "expense_categories_category_name_key" UNIQUE("category_name")
);
--> statement-breakpoint
CREATE TABLE "sale_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" integer,
	"customer_id" integer,
	"paid_amount" numeric(10, 2),
	"payment_method" varchar(50),
	"payment_date" timestamp DEFAULT now(),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "purchase_return_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_return_id" integer NOT NULL,
	"purchase_item_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" numeric(10, 2) NOT NULL,
	"unit_price" numeric(10, 2) NOT NULL,
	"line_total" numeric(12, 2) GENERATED ALWAYS AS ((quantity * unit_price)) STORED,
	CONSTRAINT "purchase_return_items_quantity_check" CHECK (quantity > (0)::numeric)
);
--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" integer,
	"product_id" integer,
	"sold_quantity" integer,
	"sold_price" numeric,
	"status" varchar(20) DEFAULT 'completed',
	"product_name_at_sale" text,
	"cost_at_sale" numeric(10, 2)
);
--> statement-breakpoint
CREATE TABLE "purchase_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"cost_price" numeric(12, 2) NOT NULL,
	"total_cost" numeric(12, 2) GENERATED ALWAYS AS ((quantity * cost_price)) STORED,
	"receive_quantity" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "purchase_returns" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_id" integer NOT NULL,
	"supplier_id" integer NOT NULL,
	"return_date" timestamp DEFAULT now() NOT NULL,
	"reason" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"category_id" integer,
	"payment_method" varchar(50),
	"reference_no" varchar(100),
	"note" text,
	"expense_date" date NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "expenses_amount_check" CHECK (amount >= (0)::numeric),
	CONSTRAINT "expenses_payment_method_check" CHECK ((payment_method)::text = ANY ((ARRAY['Cash'::character varying, 'Mobile'::character varying, 'Card'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "sale_refunds" ADD CONSTRAINT "refunds_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "supplier_ledger" ADD CONSTRAINT "supplier_ledger_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_refund_items" ADD CONSTRAINT "fk_sale_refunds_items" FOREIGN KEY ("refund_id") REFERENCES "public"."sale_refunds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_payments" ADD CONSTRAINT "sale_payments_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_payments" ADD CONSTRAINT "sale_payments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_purchase_return_id_fkey" FOREIGN KEY ("purchase_return_id") REFERENCES "public"."purchase_returns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_purchase_item_id_fkey" FOREIGN KEY ("purchase_item_id") REFERENCES "public"."purchase_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id") ON DELETE no action ON UPDATE no action;
*/