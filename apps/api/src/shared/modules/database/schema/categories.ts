import { serial, text, pgTable, integer } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	icon: text('icon').notNull(),
	order: integer('order').notNull(),
});

export type CategorySchema = typeof categories.$inferSelect;
