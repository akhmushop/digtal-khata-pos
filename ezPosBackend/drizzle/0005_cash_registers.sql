CREATE TYPE "public"."register_session_status" AS ENUM('open', 'closed');--> statement-breakpoint
CREATE TYPE "public"."register_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."register_transaction_type" AS ENUM('sale', 'cash_in', 'cash_out');--> statement-breakpoint
CREATE TABLE "register_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"register_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" "register_session_status" DEFAULT 'open' NOT NULL,
	"opening_cash" numeric(10, 2) NOT NULL,
	"expected_cash" numeric(10, 2),
	"counted_cash" numeric(10, 2),
	"difference" numeric(10, 2),
	"notes" text,
	"opened_at" timestamp with time zone DEFAULT now(),
	"closed_at" timestamp with time zone,
	CONSTRAINT "register_sessions_id_business_uq" UNIQUE("id","business_id")
);
--> statement-breakpoint
CREATE TABLE "register_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"session_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"type" "register_transaction_type" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"reference_type" varchar(50),
	"reference_id" integer,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "register_transactions_amount_check" CHECK ("register_transactions"."amount" >= 0)
);
--> statement-breakpoint
CREATE TABLE "registers" (
	"id" serial PRIMARY KEY NOT NULL,
	"business_id" integer NOT NULL,
	"location_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"status" "register_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "registers_location_name_unique" UNIQUE("location_id","name"),
	CONSTRAINT "registers_id_business_uq" UNIQUE("id","business_id")
);
--> statement-breakpoint
ALTER TABLE "register_sessions" ADD CONSTRAINT "register_sessions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "register_sessions" ADD CONSTRAINT "register_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "register_sessions" ADD CONSTRAINT "register_sessions_register_business_fkey" FOREIGN KEY ("register_id","business_id") REFERENCES "public"."registers"("id","business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "register_transactions" ADD CONSTRAINT "register_transactions_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "register_transactions" ADD CONSTRAINT "register_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "register_transactions" ADD CONSTRAINT "register_transactions_session_business_fkey" FOREIGN KEY ("session_id","business_id") REFERENCES "public"."register_sessions"("id","business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registers" ADD CONSTRAINT "registers_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "registers" ADD CONSTRAINT "registers_location_business_fkey" FOREIGN KEY ("location_id","business_id") REFERENCES "public"."locations"("id","business_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "register_sessions_one_open_per_register" ON "register_sessions" USING btree ("register_id") WHERE "register_sessions"."status" = 'open';--> statement-breakpoint
CREATE UNIQUE INDEX "register_sessions_one_open_per_user" ON "register_sessions" USING btree ("user_id","business_id") WHERE "register_sessions"."status" = 'open';--> statement-breakpoint
CREATE INDEX "register_sessions_register_idx" ON "register_sessions" USING btree ("register_id");--> statement-breakpoint
CREATE INDEX "register_transactions_session_idx" ON "register_transactions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "registers_business_location_idx" ON "registers" USING btree ("business_id","location_id");