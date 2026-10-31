CREATE SEQUENCE "public"."saas_invoice_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
CREATE TYPE "public"."subscription_actor" AS ENUM('customer', 'admin', 'system');--> statement-breakpoint
ALTER TYPE "public"."subscription_status" ADD VALUE 'suspended' BEFORE 'canceled';--> statement-breakpoint
CREATE TABLE "saas_invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"subscription_id" integer,
	"invoice_number" varchar(50) DEFAULT 'INV-' || to_char(CURRENT_DATE, 'YYYY') || '-' ||
        lpad(nextval('saas_invoice_number_seq')::text, 6, '0') NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"period_start" timestamp with time zone,
	"period_end" timestamp with time zone,
	"subtotal" numeric(10, 2) DEFAULT '0' NOT NULL,
	"discount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"vat_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) DEFAULT '0' NOT NULL,
	"currency" varchar(3) DEFAULT 'BDT' NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"due_at" timestamp with time zone,
	"paid_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "saas_invoices_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "subscription_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"subscription_id" integer NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"from_status" varchar(20),
	"to_status" varchar(20),
	"actor_type" "subscription_actor" NOT NULL,
	"actor_user_id" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscription_payments" ADD COLUMN "invoice_id" integer;--> statement-breakpoint
ALTER TABLE "subscription_payments" ADD COLUMN "gateway_session_id" varchar(100);--> statement-breakpoint
ALTER TABLE "subscription_payments" ADD COLUMN "idempotency_key" varchar(100);--> statement-breakpoint
ALTER TABLE "subscription_payments" ADD COLUMN "failure_reason" varchar(255);--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "description" varchar(500);--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "features" jsonb;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "trial_days" integer;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "is_popular" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "support_level" varchar(30);--> statement-breakpoint
ALTER TABLE "subscription_plans" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "pending_plan_id" integer;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "suspended_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "saas_invoices" ADD CONSTRAINT "saas_invoices_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saas_invoices" ADD CONSTRAINT "saas_invoices_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "saas_invoices_business_idx" ON "saas_invoices" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "subscription_events_subscription_idx" ON "subscription_events" USING btree ("subscription_id");--> statement-breakpoint
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_invoice_id_saas_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."saas_invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_pending_plan_id_subscription_plans_id_fk" FOREIGN KEY ("pending_plan_id") REFERENCES "public"."subscription_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_payments" ADD CONSTRAINT "subscription_payments_idempotency_key_unique" UNIQUE("idempotency_key");--> statement-breakpoint
UPDATE "subscription_plans" SET "limits" = '{"maxUsers":3,"maxLocations":1,"maxProducts":100}'::jsonb, "features" = '{}'::jsonb, "trial_days" = 14 WHERE "slug" = 'free-trial' AND "limits" IS NULL;

