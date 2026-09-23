CREATE SEQUENCE "public"."purchase_order_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
ALTER TABLE "purchase_items" DROP CONSTRAINT "purchase_items_product_id_fkey";
--> statement-breakpoint
ALTER TABLE "purchase_items" DROP CONSTRAINT "purchase_items_purchase_id_fkey";
--> statement-breakpoint
ALTER TABLE "purchase_items" ALTER COLUMN "quantity" SET DATA TYPE numeric(12, 3);--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "subtotal" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "purchases" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD COLUMN "variant_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD COLUMN "received_quantity" numeric(12, 3) NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD COLUMN "unit_cost" numeric(12, 2) NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD COLUMN "discount" numeric(12, 2) DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD COLUMN "tax" numeric(12, 2) DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD COLUMN "total" numeric(12, 2) GENERATED ALWAYS AS (( (quantity * unit_cost) - discount + tax )) STORED NOT NULL;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "supplier_id" integer;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "purchase_order_number" varchar(50) DEFAULT 'PO-' || to_char(CURRENT_DATE, 'YYYY') || '-' ||
        lpad(nextval('purchase_order_seq')::text, 6, '0') NOT NULL;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "purchase_date" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "tax" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "shipping_cost" numeric(10, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "total_amount" numeric(10, 2) DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplier_id_suppliers_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."suppliers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_items" DROP COLUMN "product_id";--> statement-breakpoint
ALTER TABLE "purchase_items" DROP COLUMN "cost_price";--> statement-breakpoint
ALTER TABLE "purchase_items" DROP COLUMN "total_cost";--> statement-breakpoint
ALTER TABLE "purchase_items" DROP COLUMN "receive_quantity";--> statement-breakpoint
ALTER TABLE "purchases" DROP COLUMN "supplier_name";--> statement-breakpoint
ALTER TABLE "purchases" DROP COLUMN "final_total";--> statement-breakpoint
ALTER TABLE "purchases" DROP COLUMN "note";--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_purchase_order_number_unique" UNIQUE("purchase_order_number");