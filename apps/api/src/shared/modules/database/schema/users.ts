import {
	uuid,
	text,
	real,
	integer,
	timestamp,
	pgTable,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';

import { candidateAvailabilityEnum, roleEnum } from './enums';

export const users = pgTable('users', {
	id: uuid('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	name: text('name').notNull(),
	email: text('email').unique(),
	phone: text('phone').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	role: roleEnum('role').notNull(),
	city: text('city'),
	interests: text('interests').array(),
	experience: text('experience'),
	availability: candidateAvailabilityEnum('availability'),
	acceptedContractTypes: text('accepted_contract_types').array(),
	neighborhood: text('neighborhood'),
	lat: real('lat'),
	lng: real('lng'),
	searchRadius: integer('search_radius').default(10),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type UserSchema = typeof users.$inferSelect;
export type NewUserSchema = {
	id: string;
	name: string;
	phone: string;
	email: string | null;
	city: string | null;
	role: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
	createdAt: Date;
};
