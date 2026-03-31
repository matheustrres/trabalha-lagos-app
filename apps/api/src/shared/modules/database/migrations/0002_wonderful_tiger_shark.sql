ALTER TABLE "interests" DROP CONSTRAINT "interests_user_job_unique";--> statement-breakpoint
ALTER TABLE "interests" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "interests" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "interests" ADD COLUMN "phone" text NOT NULL;--> statement-breakpoint
ALTER TABLE "interests" ADD COLUMN "city" text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "interests_user_job_unique" ON "interests" USING btree ("user_id","job_id") WHERE user_id IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "interests_phone_job_unique" ON "interests" USING btree ("phone","job_id") WHERE user_id IS NULL;