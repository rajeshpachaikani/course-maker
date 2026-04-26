CREATE TYPE "public"."legal_page_slug" AS ENUM('privacy', 'terms', 'refund', 'contact');--> statement-breakpoint
CREATE TABLE "legal_pages" (
	"slug" "legal_page_slug" PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body_tiptap" jsonb,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "company_name" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "company_address" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "contact_phone" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "support_email" text;