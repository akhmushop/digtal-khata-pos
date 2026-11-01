CREATE TABLE "storefront_api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"integration_id" integer,
	"name" varchar(120) NOT NULL,
	"publishable_key" varchar(80) NOT NULL,
	"secret_key_hash" varchar(128) NOT NULL,
	"scopes" text[] NOT NULL,
	"allowed_domains" text[],
	"environment" varchar(12) DEFAULT 'test' NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL,
	"last_used_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "storefront_api_keys_publishable_key_unique" UNIQUE("publishable_key")
);
--> statement-breakpoint
ALTER TABLE "storefront_api_keys" ADD CONSTRAINT "storefront_api_keys_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "storefront_api_keys" ADD CONSTRAINT "storefront_api_keys_integration_id_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "storefront_api_keys_business_idx" ON "storefront_api_keys" USING btree ("business_id");--> statement-breakpoint
CREATE INDEX "storefront_api_keys_secret_idx" ON "storefront_api_keys" USING btree ("secret_key_hash");