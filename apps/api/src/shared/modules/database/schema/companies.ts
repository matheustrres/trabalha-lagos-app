import { uuid, text, boolean, timestamp, pgTable } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';

import { planEnum } from './enums';
import { users } from './users';

export const companies = pgTable('companies', {
	id: uuid('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	userId: uuid('user_id')
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	document: text('document'),
	city: text('city').notNull(),
	segment: text('segment'),
	logoUrl: text('logo_url'),
	whatsapp: text('whatsapp'),
	plan: planEnum('plan').default('FREE').notNull(),
	planExpiresAt: timestamp('plan_expires_at'),
	verified: boolean('verified').default(false).notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type CompanySchema = typeof companies.$inferSelect;
export type CompanySchemaWithUser = CompanySchema & {
	user: {
		id: string;
		name: string;
		phone: string;
		city: string | null;
	};
};
