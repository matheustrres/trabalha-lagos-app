ALTER TABLE "jobs" ALTER COLUMN "contact_method" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "contact_method" SET DATA TYPE text;--> statement-breakpoint
UPDATE "jobs" SET "contact_method" = 'WHATSAPP' WHERE "contact_method" IN ('PLATFORM', 'BOTH');--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "contact_method" SET DEFAULT 'WHATSAPP'::text;--> statement-breakpoint
DROP TYPE "public"."contact_method";--> statement-breakpoint
CREATE TYPE "public"."contact_method" AS ENUM('WHATSAPP', 'EMAIL');--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "contact_method" SET DEFAULT 'WHATSAPP'::"public"."contact_method";--> statement-breakpoint
ALTER TABLE "jobs" ALTER COLUMN "contact_method" SET DATA TYPE "public"."contact_method" USING "contact_method"::"public"."contact_method";--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "contact_email" text;
