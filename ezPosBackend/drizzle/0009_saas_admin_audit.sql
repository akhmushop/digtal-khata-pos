CREATE TABLE "saas_admin_audit" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_user_id" integer NOT NULL,
	"action" varchar(60) NOT NULL,
	"entity_type" varchar(30) NOT NULL,
	"entity_id" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "saas_admin_audit" ADD CONSTRAINT "saas_admin_audit_admin_user_id_users_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "saas_admin_audit_admin_idx" ON "saas_admin_audit" USING btree ("admin_user_id");--> statement-breakpoint
CREATE INDEX "saas_admin_audit_entity_idx" ON "saas_admin_audit" USING btree ("entity_type","entity_id");