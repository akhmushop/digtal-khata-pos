CREATE TYPE "public"."allocation_mode" AS ENUM('shared', 'reserved');--> statement-breakpoint
CREATE TYPE "public"."business_mode" AS ENUM('physical_only', 'online_only', 'omnichannel');--> statement-breakpoint
CREATE TYPE "public"."fulfillment_status" AS ENUM('unfulfilled', 'processing', 'shipped', 'delivered');--> statement-breakpoint
CREATE TYPE "public"."integration_platform" AS ENUM('woocommerce', 'custom_storefront');--> statement-breakpoint
CREATE TYPE "public"."integration_status" AS ENUM('connected', 'error', 'paused', 'disconnected');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('active', 'confirmed', 'released', 'expired');--> statement-breakpoint
CREATE TYPE "public"."sale_channel" AS ENUM('pos', 'woocommerce', 'custom_storefront');--> statement-breakpoint
ALTER TYPE "public"."sale_status" ADD VALUE 'pending' BEFORE 'completed';--> statement-breakpoint
CREATE TABLE "channel_inventory_allocations" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"integration_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"location_id" integer,
	"mode" "allocation_mode" DEFAULT 'shared' NOT NULL,
	"allocated_qty" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "channel_allocations_unique" UNIQUE("integration_id","variant_id","location_id")
);
--> statement-breakpoint
CREATE TABLE "integrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"platform" "integration_platform" NOT NULL,
	"name" varchar(120) NOT NULL,
	"store_url" varchar(255),
	"location_id" integer,
	"status" "integration_status" DEFAULT 'connected' NOT NULL,
	"sync_policy" jsonb,
	"last_sync_at" timestamp with time zone,
	"health" jsonb,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "integrations_id_business_uq" UNIQUE("id","business_id")
);
--> statement-breakpoint
CREATE TABLE "inventory_reservations" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"location_id" integer,
	"sale_id" integer,
	"integration_id" integer,
	"stock_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"status" "reservation_status" DEFAULT 'active' NOT NULL,
	"idempotency_key" varchar(120),
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "inventory_reservations_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "mode" "business_mode" DEFAULT 'physical_only' NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "channel" "sale_channel" DEFAULT 'pos' NOT NULL;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "integration_id" integer;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "external_order_id" varchar(100);--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "external_order_number" varchar(100);--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "fulfillment_status" "fulfillment_status" DEFAULT 'unfulfilled' NOT NULL;--> statement-breakpoint
ALTER TABLE "channel_inventory_allocations" ADD CONSTRAINT "channel_inventory_allocations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_inventory_allocations" ADD CONSTRAINT "channel_inventory_allocations_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_inventory_allocations" ADD CONSTRAINT "channel_inventory_allocations_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "channel_inventory_allocations" ADD CONSTRAINT "channel_inventory_allocations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_reservations" ADD CONSTRAINT "inventory_reservations_stock_id_inventory_stock_id_fk" FOREIGN KEY ("stock_id") REFERENCES "public"."inventory_stock"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "channel_allocations_integration_idx" ON "channel_inventory_allocations" USING btree ("integration_id");--> statement-breakpoint
CREATE INDEX "integrations_business_idx" ON "integrations" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "inventory_reservations_stock_idx" ON "inventory_reservations" USING btree ("stock_id");--> statement-breakpoint
CREATE INDEX "inventory_reservations_sale_idx" ON "inventory_reservations" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "inventory_reservations_expiry_idx" ON "inventory_reservations" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "inventory_reservations_idempotency_active_uq" ON "inventory_reservations" USING btree ("idempotency_key") WHERE status in ('active','confirmed');--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE set null ON UPDATE no action;