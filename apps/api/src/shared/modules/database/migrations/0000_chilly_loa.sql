CREATE EXTENSION IF NOT EXISTS postgis;--> statement-breakpoint
CREATE TYPE "public"."contact_method" AS ENUM('WHATSAPP', 'PLATFORM', 'BOTH');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('CLT', 'PJ', 'FREELANCER', 'TEMPORARY', 'INTERNSHIP', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."interest_status" AS ENUM('SENT', 'VIEWED', 'CONTACTED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('ACTIVE', 'PAUSED', 'CLOSED', 'EXPIRED');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('FREE', 'PRO', 'SEASON');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('CANDIDATE', 'EMPLOYER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text NOT NULL,
	"order" integer NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role" NOT NULL,
	"city" text,
	"lat" real,
	"lng" real,
	"search_radius" integer DEFAULT 10,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"document" text NOT NULL,
	"city" text NOT NULL,
	"segment" text,
	"logo_url" text,
	"whatsapp" text,
	"plan" "plan" DEFAULT 'FREE' NOT NULL,
	"plan_expires_at" timestamp,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "companies_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"category_id" integer NOT NULL,
	"contract_type" "contract_type" NOT NULL,
	"salary_min" integer,
	"salary_max" integer,
	"salary_hidden" boolean DEFAULT false NOT NULL,
	"city" text NOT NULL,
	"address" text,
	"location" geometry(point) NOT NULL,
	"whatsapp_contact" text,
	"contact_method" "contact_method" DEFAULT 'WHATSAPP' NOT NULL,
	"status" "job_status" DEFAULT 'ACTIVE' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"urgent" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"interest_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "interests" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"job_id" uuid NOT NULL,
	"status" "interest_status" DEFAULT 'SENT' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "interests_user_job_unique" UNIQUE("user_id","job_id")
);
--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interests" ADD CONSTRAINT "interests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interests" ADD CONSTRAINT "interests_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "jobs_location_gist" ON "jobs" USING gist ("location");--> statement-breakpoint
CREATE INDEX "jobs_status_idx" ON "jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "jobs_city_idx" ON "jobs" USING btree ("city");--> statement-breakpoint
CREATE INDEX "jobs_category_idx" ON "jobs" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "jobs_created_idx" ON "jobs" USING btree ("created_at");