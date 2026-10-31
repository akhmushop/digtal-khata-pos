ALTER TABLE "saas_invoices" ALTER COLUMN "subtotal" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "saas_invoices" ALTER COLUMN "discount" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "saas_invoices" ALTER COLUMN "vat_amount" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "saas_invoices" ALTER COLUMN "total" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "business_type" varchar(50);--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "country" varchar(50);--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "currency" varchar(3) DEFAULT 'BDT' NOT NULL;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "timezone" varchar(64) DEFAULT 'Asia/Dhaka' NOT NULL;