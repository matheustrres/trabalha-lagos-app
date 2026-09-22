DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM "users"
		WHERE "email" IS NULL
			OR btrim("email") = ''
			OR btrim("email") !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
	) THEN
		RAISE EXCEPTION 'Auth e-mail migration blocked: users with missing or invalid e-mail must be fixed first';
	END IF;

	IF EXISTS (
		SELECT 1
		FROM "users"
		GROUP BY lower(btrim("email"))
		HAVING count(*) > 1
	) THEN
		RAISE EXCEPTION 'Auth e-mail migration blocked: duplicate normalized e-mails must be fixed first';
	END IF;
END $$;--> statement-breakpoint
UPDATE "users" SET "email" = lower(btrim("email"));--> statement-breakpoint
UPDATE "users" SET "phone" = NULL WHERE "role" = 'EMPLOYER';--> statement-breakpoint
UPDATE "companies" SET "whatsapp" = NULL
WHERE "user_id" IN (SELECT "id" FROM "users" WHERE "role" = 'EMPLOYER');--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_phone_unique";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL;
