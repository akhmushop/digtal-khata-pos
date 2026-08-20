ALTER TABLE "suppliers" DROP CONSTRAINT "suppliers_supplier_code_key";--> statement-breakpoint
ALTER TABLE "suppliers" DROP CONSTRAINT "suppliers_opening_balance_type_check";--> statement-breakpoint
ALTER TABLE "suppliers" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "suppliers" ALTER COLUMN "name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "suppliers" ALTER COLUMN "phone" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "suppliers" ALTER COLUMN "email" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "suppliers" ALTER COLUMN "status" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "suppliers" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "suppliers" DROP COLUMN "supplier_code";--> statement-breakpoint
ALTER TABLE "suppliers" DROP COLUMN "contact_person";--> statement-breakpoint
ALTER TABLE "suppliers" DROP COLUMN "company_name";--> statement-breakpoint
ALTER TABLE "suppliers" DROP COLUMN "opening_balance";--> statement-breakpoint
ALTER TABLE "suppliers" DROP COLUMN "opening_balance_type";--> statement-breakpoint
ALTER TABLE "suppliers" DROP COLUMN "note";--> statement-breakpoint
ALTER TABLE "suppliers" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "suppliers" DROP COLUMN "updated_at";