import {
	boolean,
	geometry,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';

import { jobStatusEnum } from './enums';

export const externalJobs = pgTable(
	'external_jobs',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => uuidv7()),
		source: text('source').notNull(),
		externalId: text('external_id').notNull(),
		title: text('title').notNull(),
		descriptionSnippet: text('description_snippet').notNull(),
		company: text('company'),
		redirectUrl: text('redirect_url').notNull(),
		categoryOriginal: text('category_original'),
		contractTypeOriginal: text('contract_type_original'),
		salaryMin: integer('salary_min'),
		salaryMax: integer('salary_max'),
		salaryPredicted: boolean('salary_predicted').default(false).notNull(),
		locationText: text('location_text').notNull(),
		locationArea: text('location_area').array().default([]).notNull(),
		city: text('city').notNull(),
		location: geometry('location', {
			type: 'point',
			mode: 'xy',
			srid: 4326,
		}),
		publishedAt: timestamp('published_at').notNull(),
		status: jobStatusEnum('status').default('ACTIVE').notNull(),
		firstSeenAt: timestamp('first_seen_at').defaultNow().notNull(),
		lastSeenAt: timestamp('last_seen_at').defaultNow().notNull(),
		expiresAt: timestamp('expires_at'),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex('external_jobs_source_external_id_unique').on(
			table.source,
			table.externalId,
		),
		index('external_jobs_location_gist').using('gist', table.location),
		index('external_jobs_status_idx').on(table.status),
		index('external_jobs_city_idx').on(table.city),
		index('external_jobs_published_at_idx').on(table.publishedAt),
	],
);

export type ExternalJobSchema = typeof externalJobs.$inferSelect;
export type NewExternalJobSchema = typeof externalJobs.$inferInsert;
