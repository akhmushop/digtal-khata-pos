CREATE TABLE "integration_credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"integration_id" integer NOT NULL,
	"cipher_text" text NOT NULL,
	"iv" varchar(32) NOT NULL,
	"auth_tag" varchar(32) NOT NULL,
	"key_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "integration_credentials_integration_id_unique" UNIQUE("integration_id")
);
--> statement-breakpoint
CREATE TABLE "integration_order_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"integration_id" integer NOT NULL,
	"sale_id" integer NOT NULL,
	"external_order_id" varchar(64) NOT NULL,
	"external_order_number" varchar(64),
	"status_version" integer DEFAULT 0 NOT NULL,
	"last_webhook_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "integration_order_mappings_external_unique" UNIQUE("integration_id","external_order_id")
);
--> statement-breakpoint
CREATE TABLE "integration_product_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"integration_id" integer NOT NULL,
	"ez_product_id" integer NOT NULL,
	"external_product_id" varchar(64) NOT NULL,
	"external_parent_id" varchar(64),
	"last_pushed_at" timestamp with time zone,
	"last_pulled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "integration_product_mappings_unique" UNIQUE("integration_id","ez_product_id")
);
--> statement-breakpoint
CREATE TABLE "integration_sync_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"integration_id" integer NOT NULL,
	"job_type" varchar(40) NOT NULL,
	"payload" jsonb,
	"status" varchar(12) DEFAULT 'queued' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 5 NOT NULL,
	"next_attempt_at" timestamp with time zone DEFAULT now() NOT NULL,
	"lastError" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "integration_sync_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"integration_id" integer NOT NULL,
	"job_type" varchar(40) NOT NULL,
	"direction" varchar(10) NOT NULL,
	"entity_type" varchar(30),
	"entity_id" integer,
	"status" varchar(10) NOT NULL,
	"message" text,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "integration_variant_mappings" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"integration_id" integer NOT NULL,
	"ez_variant_id" integer NOT NULL,
	"external_variation_id" varchar(64),
	"external_product_id" varchar(64),
	"last_pushed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "integration_variant_mappings_unique" UNIQUE("integration_id","ez_variant_id")
);
--> statement-breakpoint
ALTER TABLE "integrations" ADD COLUMN "webhook_secret" varchar(64);--> statement-breakpoint
ALTER TABLE "integration_credentials" ADD CONSTRAINT "integration_credentials_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_credentials" ADD CONSTRAINT "integration_credentials_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_order_mappings" ADD CONSTRAINT "integration_order_mappings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_order_mappings" ADD CONSTRAINT "integration_order_mappings_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_order_mappings" ADD CONSTRAINT "integration_order_mappings_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_product_mappings" ADD CONSTRAINT "integration_product_mappings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_product_mappings" ADD CONSTRAINT "integration_product_mappings_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_product_mappings" ADD CONSTRAINT "integration_product_mappings_ez_product_id_products_id_fk" FOREIGN KEY ("ez_product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_sync_jobs" ADD CONSTRAINT "integration_sync_jobs_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_sync_jobs" ADD CONSTRAINT "integration_sync_jobs_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_sync_logs" ADD CONSTRAINT "integration_sync_logs_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_sync_logs" ADD CONSTRAINT "integration_sync_logs_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_variant_mappings" ADD CONSTRAINT "integration_variant_mappings_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_variant_mappings" ADD CONSTRAINT "integration_variant_mappings_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_variant_mappings" ADD CONSTRAINT "integration_variant_mappings_ez_variant_id_product_variants_id_fk" FOREIGN KEY ("ez_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "integration_credentials_business_idx" ON "integration_credentials" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "integration_order_mappings_sale_idx" ON "integration_order_mappings" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "integration_product_mappings_external_idx" ON "integration_product_mappings" USING btree ("integration_id","external_product_id");--> statement-breakpoint
CREATE INDEX "integration_sync_jobs_due_idx" ON "integration_sync_jobs" USING btree ("status","next_attempt_at");--> statement-breakpoint
CREATE INDEX "integration_sync_logs_integration_idx" ON "integration_sync_logs" USING btree ("integration_id","created_at");--> statement-breakpoint
CREATE INDEX "integration_variant_mappings_external_idx" ON "integration_variant_mappings" USING btree ("integration_id","external_variation_id");--> statement-breakpoint
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_webhook_secret_unique" UNIQUE("webhook_secret");