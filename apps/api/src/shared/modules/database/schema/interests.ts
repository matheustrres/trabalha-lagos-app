import { uuid, timestamp, pgTable, unique } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';

import { interestStatusEnum } from './enums';
import { jobs } from './jobs';
import { users } from './users';

export const interests = pgTable(
	'interests',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => uuidv7()),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id),
		jobId: uuid('job_id')
			.notNull()
			.references(() => jobs.id),
		status: interestStatusEnum('status').default('SENT').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
	},
	(t) => [unique('interests_user_job_unique').on(t.userId, t.jobId)],
);
