import { sql } from 'drizzle-orm';
import {
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';

import { interestStatusEnum } from './enums';
import { jobs } from './jobs';
import { users } from './users';

export type InterestStatus = 'SENT' | 'VIEWED' | 'CONTACTED' | 'REJECTED';

export const interests = pgTable(
	'interests',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => uuidv7()),
		userId: uuid('user_id').references(() => users.id, {
			onDelete: 'cascade',
		}), // nullable for anonymous users
		jobId: uuid('job_id')
			.notNull()
			.references(() => jobs.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		phone: text('phone').notNull(),
		city: text('city').notNull(),
		status: interestStatusEnum('status').default('SENT').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(t) => [
		// One interest per logged-in user per job
		uniqueIndex('interests_user_job_unique')
			.on(t.userId, t.jobId)
			.where(sql`user_id IS NOT NULL`),
		// One interest per phone per job for anonymous users
		uniqueIndex('interests_phone_job_unique')
			.on(t.phone, t.jobId)
			.where(sql`user_id IS NULL`),
	],
);

export type InterestSchema = typeof interests.$inferSelect;
export type InterestSchemaWithUserAndJobIds = InterestSchema & {
	userId: string | null;
	jobId: string;
};
export type InterestSchemaWithJobTitle = InterestSchema & {
	jobTitle: string;
};
