-- Migration 0003: multi-location foundation.
-- Order matters: new columns -> default locations for data-bearing
-- businesses -> location backfill -> ONLY THEN the stock unique swap.
CREATE TABLE "user_location_assignments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"business_id" integer NOT NULL,
	"location_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_location_assignments_unique" UNIQUE("business_id","user_id","location_id")
);
--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "location_code" varchar(50);--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "location_type" varchar(20) DEFAULT 'store' NOT NULL;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "phone" varchar(20);--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "is_default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "created_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "locations" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now();--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN "location_id" integer;--> statement-breakpoint
ALTER TABLE "purchase_returns" ADD COLUMN "location_id" integer;--> statement-breakpoint
ALTER TABLE "purchases" ADD COLUMN "location_id" integer;--> statement-breakpoint
ALTER TABLE "sale_refunds" ADD COLUMN "location_id" integer;--> statement-breakpoint
ALTER TABLE "sales" ADD COLUMN "location_id" integer;--> statement-breakpoint
ALTER TABLE "serial_numbers" ADD COLUMN "location_id" integer;--> statement-breakpoint
ALTER TABLE "user_location_assignments" ADD CONSTRAINT "user_location_assignments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_location_assignments" ADD CONSTRAINT "user_location_assignments_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_location_assignments" ADD CONSTRAINT "user_location_assignments_location_business_fkey" FOREIGN KEY ("location_id","business_id") REFERENCES "public"."locations"("id","business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_location_assignments_user_idx" ON "user_location_assignments" USING btree ("business_id","user_id");--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_location_business_fkey" FOREIGN KEY ("location_id","business_id") REFERENCES "public"."locations"("id","business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_location_business_fkey" FOREIGN KEY ("location_id","business_id") REFERENCES "public"."locations"("id","business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_location_business_fkey" FOREIGN KEY ("location_id","business_id") REFERENCES "public"."locations"("id","business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_refunds" ADD CONSTRAINT "sale_refunds_location_business_fkey" FOREIGN KEY ("location_id","business_id") REFERENCES "public"."locations"("id","business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_location_business_fkey" FOREIGN KEY ("location_id","business_id") REFERENCES "public"."locations"("id","business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "serial_numbers" ADD CONSTRAINT "serial_numbers_location_business_fkey" FOREIGN KEY ("location_id","business_id") REFERENCES "public"."locations"("id","business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expenses_business_location_idx" ON "expenses" USING btree ("business_id","location_id");--> statement-breakpoint
CREATE UNIQUE INDEX "locations_one_default_per_business" ON "locations" USING btree ("business_id") WHERE "locations"."is_default";--> statement-breakpoint
CREATE INDEX "purchase_returns_business_location_idx" ON "purchase_returns" USING btree ("business_id","location_id");--> statement-breakpoint
CREATE INDEX "purchases_business_location_idx" ON "purchases" USING btree ("business_id","location_id");--> statement-breakpoint
CREATE INDEX "sale_refunds_business_location_idx" ON "sale_refunds" USING btree ("business_id","location_id");--> statement-breakpoint
CREATE INDEX "sales_business_location_idx" ON "sales" USING btree ("business_id","location_id");--> statement-breakpoint
CREATE INDEX "serial_numbers_business_location_idx" ON "serial_numbers" USING btree ("business_id","location_id");--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_business_code_unique" UNIQUE("business_id","location_code");--> statement-breakpoint
-- Drop the single-location stock key BEFORE backfill; the per-location key
-- is added only after every stock row has a location (end of file).
ALTER TABLE "inventory_stock" DROP CONSTRAINT "inventory_stock_variant_id_unique";--> statement-breakpoint
-- ============================================================
-- BACKFILL (data preservation): a default "Main Store" is created ONLY for
-- businesses that already own inventory or transaction data — their
-- location-bearing records need a home. Businesses without such data get no
-- automatic location: they create their first location manually.
-- ============================================================
INSERT INTO "locations" ("business_id", "name", "location_type", "is_default", "status")
SELECT b."id", 'Main Store', 'store', true, 'active'
FROM "businesses" b
WHERE (
  EXISTS (SELECT 1 FROM "inventory_stock" s WHERE s."business_id" = b."id")
  OR EXISTS (SELECT 1 FROM "inventory_batches" s WHERE s."business_id" = b."id")
  OR EXISTS (SELECT 1 FROM "inventory_movements" s WHERE s."business_id" = b."id")
  OR EXISTS (SELECT 1 FROM "sales" s WHERE s."business_id" = b."id")
  OR EXISTS (SELECT 1 FROM "purchases" s WHERE s."business_id" = b."id")
  OR EXISTS (SELECT 1 FROM "expenses" s WHERE s."business_id" = b."id")
)
AND NOT EXISTS (
  SELECT 1 FROM "locations" l
  WHERE l."business_id" = b."id" AND l."is_default"
);--> statement-breakpoint
UPDATE "inventory_stock" s
SET "location_id" = l."id"
FROM "locations" l
WHERE l."business_id" = s."business_id" AND l."is_default" AND s."location_id" IS NULL;--> statement-breakpoint
UPDATE "inventory_batches" b
SET "location_id" = l."id"
FROM "locations" l
WHERE l."business_id" = b."business_id" AND l."is_default" AND b."location_id" IS NULL;--> statement-breakpoint
-- Movements inherit the location of the stock row for their variant
-- (pre-migration there is exactly one stock row per variant).
UPDATE "inventory_movements" m
SET "location_id" = s."location_id"
FROM "inventory_stock" s
WHERE s."variant_id" = m."variant_id" AND s."business_id" = m."business_id" AND m."location_id" IS NULL;--> statement-breakpoint
UPDATE "sales" x
SET "location_id" = l."id"
FROM "locations" l
WHERE l."business_id" = x."business_id" AND l."is_default" AND x."location_id" IS NULL;--> statement-breakpoint
UPDATE "purchases" x
SET "location_id" = l."id"
FROM "locations" l
WHERE l."business_id" = x."business_id" AND l."is_default" AND x."location_id" IS NULL;--> statement-breakpoint
UPDATE "expenses" x
SET "location_id" = l."id"
FROM "locations" l
WHERE l."business_id" = x."business_id" AND l."is_default" AND x."location_id" IS NULL;--> statement-breakpoint
UPDATE "sale_refunds" r
SET "location_id" = s."location_id"
FROM "sales" s
WHERE s."id" = r."sale_id" AND r."location_id" IS NULL;--> statement-breakpoint
UPDATE "purchase_returns" r
SET "location_id" = p."location_id"
FROM "purchases" p
WHERE p."id" = r."purchase_id" AND r."location_id" IS NULL;--> statement-breakpoint
UPDATE "serial_numbers" sn
SET "location_id" = b."location_id"
FROM "inventory_batches" b
WHERE b."id" = sn."batch_id" AND sn."location_id" IS NULL;--> statement-breakpoint
-- Now that every stock row has a location, enforce the per-location key.
ALTER TABLE "inventory_stock" ADD CONSTRAINT "inventory_stock_business_variant_location_unique" UNIQUE("business_id","variant_id","location_id");
