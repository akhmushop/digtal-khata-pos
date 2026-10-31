CREATE TYPE "public"."stock_transfer_status" AS ENUM('draft', 'shipped', 'partially_received', 'received', 'cancelled');--> statement-breakpoint
CREATE TABLE "stock_transfer_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"transfer_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"quantity_shipped" integer DEFAULT 0 NOT NULL,
	"quantity_received" integer DEFAULT 0 NOT NULL,
	"unit_cost" numeric(10, 2) DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_transfers" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"transfer_number" varchar(30) NOT NULL,
	"from_location_id" integer NOT NULL,
	"to_location_id" integer NOT NULL,
	"status" "stock_transfer_status" DEFAULT 'draft' NOT NULL,
	"notes" text,
	"shipped_at" timestamp with time zone,
	"received_at" timestamp with time zone,
	"created_by_user_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "stock_transfers_business_number_unique" UNIQUE("business_id","transfer_number"),
	CONSTRAINT "stock_transfers_id_business_uq" UNIQUE("id","business_id"),
	CONSTRAINT "stock_transfers_different_locations_check" CHECK ("stock_transfers"."from_location_id" <> "stock_transfers"."to_location_id")
);
--> statement-breakpoint
ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_transfer_business_fkey" FOREIGN KEY ("transfer_id","business_id") REFERENCES "public"."stock_transfers"("id","business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "stock_transfer_items_variant_business_fkey" FOREIGN KEY ("variant_id","business_id") REFERENCES "public"."product_variants"("id","business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_from_location_business_fkey" FOREIGN KEY ("from_location_id","business_id") REFERENCES "public"."locations"("id","business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_transfers" ADD CONSTRAINT "stock_transfers_to_location_business_fkey" FOREIGN KEY ("to_location_id","business_id") REFERENCES "public"."locations"("id","business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "stock_transfer_items_transfer_idx" ON "stock_transfer_items" USING btree ("transfer_id");--> statement-breakpoint
CREATE INDEX "stock_transfers_business_status_idx" ON "stock_transfers" USING btree ("business_id","status");