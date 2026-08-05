ALTER TABLE "product_variants" ALTER COLUMN "expiry_date" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "serial_numbers" ALTER COLUMN "sold_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_sku_unique" UNIQUE("sku");--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_barcode_unique" UNIQUE("barcode");