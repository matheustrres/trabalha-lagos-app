CREATE TABLE "external_jobs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"source" text NOT NULL,
	"external_id" text NOT NULL,
	"title" text NOT NULL,
	"description_snippet" text NOT NULL,
	"company" text,
	"redirect_url" text NOT NULL,
	"category_original" text,
	"contract_type_original" text,
	"salary_min" integer,
	"salary_max" integer,
	"salary_predicted" boolean DEFAULT false NOT NULL,
	"location_text" text NOT NULL,
	"location_area" text[] DEFAULT '{}' NOT NULL,
	"city" text NOT NULL,
	"location" geometry(point),
	"published_at" timestamp NOT NULL,
	"status" "job_status" DEFAULT 'ACTIVE' NOT NULL,
	"first_seen_at" timestamp DEFAULT now() NOT NULL,
	"last_seen_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "external_jobs_source_external_id_unique" ON "external_jobs" USING btree ("source","external_id");--> statement-breakpoint
CREATE INDEX "external_jobs_location_gist" ON "external_jobs" USING gist ("location");--> statement-breakpoint
CREATE INDEX "external_jobs_status_idx" ON "external_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "external_jobs_city_idx" ON "external_jobs" USING btree ("city");--> statement-breakpoint
CREATE INDEX "external_jobs_published_at_idx" ON "external_jobs" USING btree ("published_at");