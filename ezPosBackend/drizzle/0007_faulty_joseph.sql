CREATE TYPE "public"."sale_status" AS ENUM('completed', 'held', 'cancelled', 'refunded');--> statement-breakpoint
CREATE SEQUENCE "public"."sale_invoice_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
ALTER TABLE "sales" DROP CONSTRAINT "sales_invoice_number_key";--> statement-breakpoint
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_sale_id_fkey";
--> statement-breakpoint
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_product_id_fkey";
--> statement-breakpoint
ALTER TABLE "sale_payments" DROP CONSTRAINT "sale_payments_sale_id_fkey";
--> statement-breakpoint
ALTER TABLE "sale_payments" DROP CONSTRAINT "sale_payments_customer_id_fkey";
--> statement-breakpoint
ALTER TABLE "sales" DROP CONSTRAINT "sales_customer_id_fkey";
--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "payment_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "payment_status" SET DEFAULT 'unpaid'::text;--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "payment_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "payment_status" SET DEFAULT 'paid'::text;--> statement-breakpoint
DROP TYPE "public"."payment_status";--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('paid', 'partial', 'unpaid');--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "payment_status" SET DEFAULT 'unpaid'::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "payment_status" SET DATA TYPE "public"."payment_status" USING "payment_status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "payment_status" SET DEFAULT 'paid'::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "payment_status" SET DATA TYPE "public"."payment_status" USING "payment_status"::"public"."payment_status";--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "sale_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "cost_at_sale" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "sale_items" ALTER COLUMN "cost_at_sale" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_payments" ALTER COLUMN "sale_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_payments" ALTER COLUMN "payment_method" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_payments" ALTER COLUMN "payment_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "status" SET DEFAULT 'completed'::"public"."sale_status";--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "status" SET DATA TYPE "public"."sale_status" USING "status"::"public"."sale_status";--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "invoice_number" SET DEFAULT 'INV-' || to_char(CURRENT_DATE, 'YYYY') || '-' ||
        lpad(nextval('sale_invoice_number_seq')::text, 6, '0');--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "invoice_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "discount" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "vat" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "payment_status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ALTER COLUMN "due_amount" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "sale_items" ADD COLUMN "variant_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_items" ADD COLUMN "quantity" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_items" ADD COLUMN "selling_price" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_items" ADD COLUMN "discount" numeric(12, 2) DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_items" ADD COLUMN "line_total" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_payments" ADD COLUMN "amount" numeric(10, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_payments" ADD COLUMN "reference" varchar(100);--> statement-breakpoint
ALTER TABLE "sale_payments" ADD COLUMN "tendered" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "purchase_date" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_payments" ADD CONSTRAINT "sale_payments_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_payments" ADD CONSTRAINT "sale_payments_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" DROP COLUMN "product_id";--> statement-breakpoint
ALTER TABLE "sale_items" DROP COLUMN "sold_quantity";--> statement-breakpoint
ALTER TABLE "sale_items" DROP COLUMN "sold_price";--> statement-breakpoint
ALTER TABLE "sale_items" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "sale_items" DROP COLUMN "product_name_at_sale";--> statement-breakpoint
ALTER TABLE "sale_payments" DROP COLUMN "paid_amount";--> statement-breakpoint
ALTER TABLE "sales" DROP COLUMN "sale_date";--> statement-breakpoint
ALTER TABLE "sale_payments" ADD CONSTRAINT "sale_payments_method_reference_unique" UNIQUE("payment_method","reference");--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_invoice_number_unique" UNIQUE("invoice_number");--> statement-breakpoint
ALTER TABLE "sale_payments" ADD CONSTRAINT "sale_payments_amount_positive" CHECK ("sale_payments"."amount" > 0);--> statement-breakpoint
ALTER TABLE "sale_payments" ADD CONSTRAINT "sale_payments_method_valid" CHECK ("sale_payments"."payment_method" in ('cash','bangla_qr','card'));