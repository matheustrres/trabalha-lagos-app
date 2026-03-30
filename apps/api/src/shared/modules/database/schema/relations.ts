import { relations } from 'drizzle-orm';

import { categories } from './categories';
import { companies } from './companies';
import { interests } from './interests';
import { jobs } from './jobs';
import { users } from './users';

export const usersRelations = relations(users, ({ one, many }) => ({
	company: one(companies, {
		fields: [users.id],
		references: [companies.userId],
	}),
	interests: many(interests),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
	user: one(users, {
		fields: [companies.userId],
		references: [users.id],
	}),
	jobs: many(jobs),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
	jobs: many(jobs),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
	company: one(companies, {
		fields: [jobs.companyId],
		references: [companies.id],
	}),
	category: one(categories, {
		fields: [jobs.categoryId],
		references: [categories.id],
	}),
	interests: many(interests),
}));

export const interestsRelations = relations(interests, ({ one }) => ({
	user: one(users, {
		fields: [interests.userId],
		references: [users.id],
	}),
	job: one(jobs, {
		fields: [interests.jobId],
		references: [jobs.id],
	}),
}));
