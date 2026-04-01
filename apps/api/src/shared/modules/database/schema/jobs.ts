import {
	pgTable,
	text,
	integer,
	boolean,
	timestamp,
	index,
	uuid,
	geometry,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';

import { categories } from './categories';
import { companies } from './companies';
import { contractTypeEnum, jobStatusEnum, contactMethodEnum } from './enums';

export type JobStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';

export const jobs = pgTable(
	'jobs',
	{
		id: uuid('id')
			.primaryKey()
			.$defaultFn(() => uuidv7()),
		companyId: uuid('company_id')
			.notNull()
			.references(() => companies.id),
		title: text('title').notNull(),
		slug: text('slug').notNull().unique(),
		description: text('description').notNull(),
		categoryId: integer('category_id')
			.notNull()
			.references(() => categories.id),
		contractType: contractTypeEnum('contract_type').notNull(),
		salaryMin: integer('salary_min'),
		salaryMax: integer('salary_max'),
		salaryHidden: boolean('salary_hidden').default(false).notNull(),
		city: text('city').notNull(),
		address: text('address'),
		location: geometry('location', {
			type: 'point',
			mode: 'xy',
			srid: 4326,
		}).notNull(),
		whatsappContact: text('whatsapp_contact'),
		contactMethod: contactMethodEnum('contact_method')
			.default('WHATSAPP')
			.notNull(),
		status: jobStatusEnum('status').default('ACTIVE').notNull(),
		featured: boolean('featured').default(false).notNull(),
		urgent: boolean('urgent').default(false).notNull(),
		expiresAt: timestamp('expires_at').notNull(),
		viewCount: integer('view_count').default(0).notNull(),
		interestCount: integer('interest_count').default(0).notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at').defaultNow().notNull(),
	},
	(t) => [
		index('jobs_location_gist').using('gist', t.location),
		index('jobs_status_idx').on(t.status),
		index('jobs_city_idx').on(t.city),
		index('jobs_category_idx').on(t.categoryId),
		index('jobs_created_idx').on(t.createdAt),
	],
);

export type JobSchema = typeof jobs.$inferSelect;

export type JobSchemaWithDetails = JobSchema & {
	company: {
		id: string;
		name: string;
		logoUrl: string | null;
		verified: boolean;
		plan: 'FREE' | 'PRO' | 'SEASON';
	};
	category: {
		id: number;
		name: string;
		slug: string;
		icon: string | null;
	};
	distanceKm: number | null;
};

export type JobSchemaWithCategory = JobSchema & {
	category: {
		id: number;
		name: string;
		slug: string;
		icon: string | null;
	};
};

// Tipos derivados que omitem location (usado com columns: { location: false })
export type JobSchemaWithDetailsNoLocation = Omit<
	JobSchemaWithDetails,
	'location'
>;
export type JobSchemaWithCategoryNoLocation = Omit<
	JobSchemaWithCategory,
	'location'
>;

// Tipo específico para findBySlug (tem company + category, mas sem distanceKm)
export type JobSchemaWithRelations = Omit<
	JobSchema & {
		company: {
			id: string;
			name: string;
			logoUrl: string | null;
			verified: boolean;
			plan: 'FREE' | 'PRO' | 'SEASON';
		};
		category: {
			id: number;
			name: string;
			slug: string;
			icon: string | null;
		};
	},
	'location'
>;
