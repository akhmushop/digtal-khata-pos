CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"business_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "user_roles_business_user_role_unique" UNIQUE("business_id","user_id","role_id")
);
--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "module" varchar(50);--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_business_id_businesses_id_fk" FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_roles_business_user_idx" ON "user_roles" ("business_id","user_id");
--> statement-breakpoint
-- Backfill: every existing membership becomes a role assignment (idempotent).
INSERT INTO "user_roles" ("user_id", "business_id", "role_id")
SELECT "user_id", "business_id", "role_id" FROM "business_memberships"
ON CONFLICT ("business_id", "user_id", "role_id") DO NOTHING;
