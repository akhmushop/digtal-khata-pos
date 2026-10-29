ALTER TABLE "expense_categories" DROP CONSTRAINT "expense_categories_category_name_key";;
--> statement-breakpoint
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_sku_unique";;
--> statement-breakpoint
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_barcode_unique";;
--> statement-breakpoint
ALTER TABLE "purchases" DROP CONSTRAINT "purchases_purchase_order_number_unique";;
--> statement-breakpoint
ALTER TABLE "sales" DROP CONSTRAINT "sales_invoice_number_unique";;
--> statement-breakpoint
ALTER TABLE "serial_numbers" DROP CONSTRAINT "serial_numbers_serial_number_unique";;
--> statement-breakpoint
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_category_id_fkey";;
--> statement-breakpoint
ALTER TABLE "inventory_batches" DROP CONSTRAINT "inventory_batches_variant_id_product_variants_id_fk";;
--> statement-breakpoint
ALTER TABLE "inventory_batches" DROP CONSTRAINT "inventory_batches_location_id_locations_id_fk";;
--> statement-breakpoint
ALTER TABLE "inventory_batches" DROP CONSTRAINT "inventory_batches_purchase_item_id_purchase_items_id_fk";;
--> statement-breakpoint
ALTER TABLE "inventory_movements" DROP CONSTRAINT "inventory_movements_variant_id_product_variants_id_fk";;
--> statement-breakpoint
ALTER TABLE "inventory_movements" DROP CONSTRAINT "inventory_movements_location_id_locations_id_fk";;
--> statement-breakpoint
ALTER TABLE "inventory_movements" DROP CONSTRAINT "inventory_movements_batch_id_inventory_batches_id_fk";;
--> statement-breakpoint
ALTER TABLE "product_images" DROP CONSTRAINT "product_images_product_id_products_id_fk";;
--> statement-breakpoint
ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_product_id_products_id_fk";;
--> statement-breakpoint
ALTER TABLE "purchase_items" DROP CONSTRAINT "purchase_items_purchase_id_purchases_id_fk";;
--> statement-breakpoint
ALTER TABLE "purchase_items" DROP CONSTRAINT "purchase_items_variant_id_product_variants_id_fk";;
--> statement-breakpoint
ALTER TABLE "purchase_payments" DROP CONSTRAINT "purchase_payments_purchase_id_purchases_id_fk";;
--> statement-breakpoint
ALTER TABLE "purchase_return_items" DROP CONSTRAINT "purchase_return_items_purchase_return_id_fkey";;
--> statement-breakpoint
ALTER TABLE "purchase_return_items" DROP CONSTRAINT "purchase_return_items_purchase_item_id_fkey";;
--> statement-breakpoint
ALTER TABLE "purchase_return_items" DROP CONSTRAINT "purchase_return_items_product_id_fkey";;
--> statement-breakpoint
ALTER TABLE "purchase_returns" DROP CONSTRAINT "purchase_returns_purchase_id_fkey";;
--> statement-breakpoint
ALTER TABLE "purchase_returns" DROP CONSTRAINT "purchase_returns_supplier_id_fkey";;
--> statement-breakpoint
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_sale_id_sales_id_fk";;
--> statement-breakpoint
ALTER TABLE "sale_items" DROP CONSTRAINT "sale_items_variant_id_product_variants_id_fk";;
--> statement-breakpoint
ALTER TABLE "sale_payments" DROP CONSTRAINT "sale_payments_sale_id_sales_id_fk";;
--> statement-breakpoint
ALTER TABLE "sale_refund_items" DROP CONSTRAINT "fk_sale_refunds_items";;
--> statement-breakpoint
ALTER TABLE "sale_refunds" DROP CONSTRAINT "refunds_sale_id_fkey";;
--> statement-breakpoint
ALTER TABLE "serial_numbers" DROP CONSTRAINT "serial_numbers_variant_id_product_variants_id_fk";;
--> statement-breakpoint
ALTER TABLE "serial_numbers" DROP CONSTRAINT "serial_numbers_batch_id_inventory_batches_id_fk";;
--> statement-breakpoint
ALTER TABLE "serial_numbers" DROP CONSTRAINT "serial_numbers_purchase_item_id_purchase_items_id_fk";;
--> statement-breakpoint
ALTER TABLE "serial_numbers" DROP CONSTRAINT "serial_numbers_sale_item_id_sale_items_id_fk";;
--> statement-breakpoint
ALTER TABLE "supplier_ledger" DROP CONSTRAINT "supplier_ledger_supplier_id_fkey";;
--> statement-breakpoint
ALTER TABLE "variant_images" DROP CONSTRAINT "variant_images_variant_id_product_variants_id_fk";;
--> statement-breakpoint
ALTER TABLE "variant_options" DROP CONSTRAINT "variant_options_variant_type_id_variant_types_id_fk";;
--> statement-breakpoint
ALTER TABLE "variant_values" DROP CONSTRAINT "variant_values_variant_id_product_variants_id_fk";;
--> statement-breakpoint
ALTER TABLE "variant_values" DROP CONSTRAINT "variant_values_option_id_variant_options_id_fk";;
--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "expense_categories" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "inventory_batches" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "inventory_stock" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "product_images" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "purchase_items" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "purchase_payments" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "purchase_return_items" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "purchase_returns" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "sale_items" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "sale_payments" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "sale_refund_items" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "sale_refunds" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "serial_numbers" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "supplier_ledger" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "suppliers" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "units" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "variant_images" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "variant_options" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "variant_types" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "variant_values" ADD COLUMN "business_id" integer NOT NULL;;
--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_id_business_uq" UNIQUE("id","business_id");;
--> statement-breakpoint
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_id_business_uq" UNIQUE("id","business_id");;
--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_id_business_uq" UNIQUE("id","business_id");;
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_id_business_uq" UNIQUE("id","business_id");;
--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_id_business_uq" UNIQUE("id","business_id");;
--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_id_business_uq" UNIQUE("id","business_id");;
--> statement-breakpoint
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_id_business_uq" UNIQUE("id","business_id");;
--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_id_business_uq" UNIQUE("id","business_id");;
--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_id_business_uq" UNIQUE("id","business_id");;
--> statement-breakpoint
ALTER TABLE "sale_refunds" ADD CONSTRAINT "sale_refunds_id_business_uq" UNIQUE("id","business_id");;
--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_id_business_uq" UNIQUE("id","business_id");;
--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_id_business_uq" UNIQUE("id","business_id");;
--> statement-breakpoint
ALTER TABLE "variant_options" ADD CONSTRAINT "variant_options_id_business_uq" UNIQUE("id","business_id");;
--> statement-breakpoint
ALTER TABLE "variant_types" ADD CONSTRAINT "variant_types_id_business_uq" UNIQUE("id","business_id");;
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_business_fkey" FOREIGN KEY ("category_id","business_id") REFERENCES "public"."expense_categories"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_variant_business_fkey" FOREIGN KEY ("variant_id","business_id") REFERENCES "public"."product_variants"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_location_business_fkey" FOREIGN KEY ("location_id","business_id") REFERENCES "public"."locations"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "inventory_batches" ADD CONSTRAINT "inventory_batches_purchase_item_business_fkey" FOREIGN KEY ("purchase_item_id","business_id") REFERENCES "public"."purchase_items"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_variant_business_fkey" FOREIGN KEY ("variant_id","business_id") REFERENCES "public"."product_variants"("id","business_id") ON DELETE restrict ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_location_business_fkey" FOREIGN KEY ("location_id","business_id") REFERENCES "public"."locations"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_batch_business_fkey" FOREIGN KEY ("batch_id","business_id") REFERENCES "public"."inventory_batches"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_variant_business_fkey" FOREIGN KEY ("variant_id","business_id") REFERENCES "public"."product_variants"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_business_fkey" FOREIGN KEY ("product_id","business_id") REFERENCES "public"."products"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_business_fkey" FOREIGN KEY ("product_id","business_id") REFERENCES "public"."products"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchase_business_fkey" FOREIGN KEY ("purchase_id","business_id") REFERENCES "public"."purchases"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_variant_business_fkey" FOREIGN KEY ("variant_id","business_id") REFERENCES "public"."product_variants"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "purchase_payments" ADD CONSTRAINT "purchase_payments_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "purchase_payments" ADD CONSTRAINT "purchase_payments_purchase_business_fkey" FOREIGN KEY ("purchase_id","business_id") REFERENCES "public"."purchases"("id","business_id") ON DELETE cascade ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_return_business_fkey" FOREIGN KEY ("purchase_return_id","business_id") REFERENCES "public"."purchase_returns"("id","business_id") ON DELETE cascade ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_item_business_fkey" FOREIGN KEY ("purchase_item_id","business_id") REFERENCES "public"."purchase_items"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_product_business_fkey" FOREIGN KEY ("product_id","business_id") REFERENCES "public"."products"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_purchase_business_fkey" FOREIGN KEY ("purchase_id","business_id") REFERENCES "public"."purchases"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_supplier_business_fkey" FOREIGN KEY ("supplier_id","business_id") REFERENCES "public"."suppliers"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_business_fkey" FOREIGN KEY ("sale_id","business_id") REFERENCES "public"."sales"("id","business_id") ON DELETE cascade ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_variant_business_fkey" FOREIGN KEY ("variant_id","business_id") REFERENCES "public"."product_variants"("id","business_id") ON DELETE restrict ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "sale_payments" ADD CONSTRAINT "sale_payments_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "sale_payments" ADD CONSTRAINT "sale_payments_sale_business_fkey" FOREIGN KEY ("sale_id","business_id") REFERENCES "public"."sales"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "sale_refund_items" ADD CONSTRAINT "sale_refund_items_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "sale_refund_items" ADD CONSTRAINT "sale_refund_items_refund_business_fkey" FOREIGN KEY ("refund_id","business_id") REFERENCES "public"."sale_refunds"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "sale_refund_items" ADD CONSTRAINT "sale_refund_items_sale_item_business_fkey" FOREIGN KEY ("sale_item_id","business_id") REFERENCES "public"."sale_items"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "sale_refund_items" ADD CONSTRAINT "sale_refund_items_product_business_fkey" FOREIGN KEY ("product_id","business_id") REFERENCES "public"."products"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "sale_refunds" ADD CONSTRAINT "sale_refunds_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "sale_refunds" ADD CONSTRAINT "refunds_sale_business_fkey" FOREIGN KEY ("sale_id","business_id") REFERENCES "public"."sales"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_variant_business_fkey" FOREIGN KEY ("variant_id","business_id") REFERENCES "public"."product_variants"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_batch_business_fkey" FOREIGN KEY ("batch_id","business_id") REFERENCES "public"."inventory_batches"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_purchase_item_business_fkey" FOREIGN KEY ("purchase_item_id","business_id") REFERENCES "public"."purchase_items"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_sale_item_business_fkey" FOREIGN KEY ("sale_item_id","business_id") REFERENCES "public"."sale_items"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "supplier_ledger" ADD CONSTRAINT "supplier_ledger_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "supplier_ledger" ADD CONSTRAINT "supplier_ledger_supplier_business_fkey" FOREIGN KEY ("supplier_id","business_id") REFERENCES "public"."suppliers"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "variant_images" ADD CONSTRAINT "variant_images_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "variant_images" ADD CONSTRAINT "variant_images_variant_business_fkey" FOREIGN KEY ("variant_id","business_id") REFERENCES "public"."product_variants"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "variant_options" ADD CONSTRAINT "variant_options_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "variant_options" ADD CONSTRAINT "variant_options_type_business_fkey" FOREIGN KEY ("variant_type_id","business_id") REFERENCES "public"."variant_types"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "variant_types" ADD CONSTRAINT "variant_types_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "variant_values" ADD CONSTRAINT "variant_values_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "variant_values" ADD CONSTRAINT "variant_values_variant_business_fkey" FOREIGN KEY ("variant_id","business_id") REFERENCES "public"."product_variants"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
ALTER TABLE "variant_values" ADD CONSTRAINT "variant_values_option_business_fkey" FOREIGN KEY ("option_id","business_id") REFERENCES "public"."variant_options"("id","business_id") ON DELETE no action ON UPDATE no action;;
--> statement-breakpoint
CREATE INDEX "brands_business_id_idx" ON "brands" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "categories_business_id_idx" ON "categories" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "customers_business_id_idx" ON "customers" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "expense_categories_business_id_idx" ON "expense_categories" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "expenses_business_id_idx" ON "expenses" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "inventory_batches_business_id_idx" ON "inventory_batches" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "inventory_movements_business_id_idx" ON "inventory_movements" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "inventory_stock_business_id_idx" ON "inventory_stock" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "locations_business_id_idx" ON "locations" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "product_images_business_id_idx" ON "product_images" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "products_business_id_idx" ON "products" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "product_variants_business_id_idx" ON "product_variants" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "purchase_items_business_id_idx" ON "purchase_items" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "purchase_payments_business_id_idx" ON "purchase_payments" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "purchase_return_items_business_id_idx" ON "purchase_return_items" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "purchase_returns_business_id_idx" ON "purchase_returns" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "purchases_business_id_idx" ON "purchases" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "sale_items_business_id_idx" ON "sale_items" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "sale_payments_business_id_idx" ON "sale_payments" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "sale_refund_items_business_id_idx" ON "sale_refund_items" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "sale_refunds_business_id_idx" ON "sale_refunds" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "sales_business_id_idx" ON "sales" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "serial_numbers_business_id_idx" ON "serial_numbers" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "supplier_ledger_business_id_idx" ON "supplier_ledger" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "suppliers_business_id_idx" ON "suppliers" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "units_business_id_idx" ON "units" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "variant_images_business_id_idx" ON "variant_images" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "variant_options_business_id_idx" ON "variant_options" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "variant_types_business_id_idx" ON "variant_types" USING btree ("business_id");;
--> statement-breakpoint
CREATE INDEX "variant_values_business_id_idx" ON "variant_values" USING btree ("business_id");;
--> statement-breakpoint
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_business_name_unique" UNIQUE("business_id","category_name");;
--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_business_sku_unique" UNIQUE("business_id","sku");;
--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_business_barcode_unique" UNIQUE("business_id","barcode");;
--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_business_po_unique" UNIQUE("business_id","purchase_order_number");;
--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_business_invoice_unique" UNIQUE("business_id","invoice_number");;
--> statement-breakpoint
ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_business_serial_unique" UNIQUE("business_id","serial_number");