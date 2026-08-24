CREATE TABLE "inventory_stock" (
	"id" serial PRIMARY KEY NOT NULL,
	"variant_id" integer,
	"location_id" integer,
	"quantity" integer DEFAULT 0,
	"reserved_quantity" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;