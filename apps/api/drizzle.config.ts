import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/shared/modules/database/schema/index.ts',
	out: './src/shared/modules/database/migrations',
	dialect: 'postgresql',
	dbCredentials: { url: process.env['DATABASE_URL']! },
	extensionsFilters: ['postgis'],
});
