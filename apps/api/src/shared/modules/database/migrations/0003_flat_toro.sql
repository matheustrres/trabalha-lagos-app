CREATE TYPE "public"."candidate_availability" AS ENUM('IMMEDIATE', 'IN_15_DAYS', 'IN_30_DAYS', 'NEGOTIABLE');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "interests" text[];--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "experience" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "availability" "candidate_availability";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "accepted_contract_types" text[];--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "neighborhood" text;