import { Client } from 'pg';

import {
	setup as testContainersSetup,
	teardown as testContainersTeardown,
} from './test-containers-setup';

const categories = [
	{ name: 'Comércio e Varejo', slug: 'comercio-varejo', icon: '🏪', order: 1 },
	{
		name: 'Turismo e Hospitalidade',
		slug: 'turismo-hospitalidade',
		icon: '🏨',
		order: 2,
	},
	{
		name: 'Construção e Manutenção',
		slug: 'construcao-manutencao',
		icon: '🔨',
		order: 3,
	},
	{ name: 'Serviços Gerais', slug: 'servicos-gerais', icon: '🧹', order: 4 },
	{ name: 'Alimentação', slug: 'alimentacao', icon: '🍽️', order: 5 },
	{ name: 'Saúde e Beleza', slug: 'saude-beleza', icon: '💇', order: 6 },
	{ name: 'Educação', slug: 'educacao', icon: '📚', order: 7 },
	{ name: 'Administrativo', slug: 'administrativo', icon: '📋', order: 8 },
	{
		name: 'Tecnologia e Remoto',
		slug: 'tecnologia-remoto',
		icon: '💻',
		order: 9,
	},
	{ name: 'Outros', slug: 'outros', icon: '📦', order: 10 },
];

export async function setup(): Promise<void> {
	// Ensure JWT secrets are set for tests
	process.env['JWT_SECRET'] =
		process.env['JWT_SECRET'] || 'test-jwt-secret-long-enough-32-chars!!';
	process.env['JWT_REFRESH_SECRET'] =
		process.env['JWT_REFRESH_SECRET'] ||
		'test-jwt-refresh-secret-long-enough-32!!';

	// Start containers and run migrations
	await testContainersSetup();

	// Seed categories after containers are ready
	const databaseUrl = process.env['DATABASE_URL'];
	if (!databaseUrl) throw new Error('[e2e] DATABASE_URL is required');

	const dbClient = new Client({ connectionString: databaseUrl });
	await dbClient.connect();

	console.log('[e2e] Seeding categories...');

	for (const cat of categories) {
		try {
			await dbClient.query(
				`INSERT INTO categories (name, slug, icon, "order") VALUES ($1, $2, $3, $4) ON CONFLICT (slug) DO NOTHING`,
				[cat.name, cat.slug, cat.icon, cat.order],
			);
		} catch (err: unknown) {
			// Ignore errors if table doesn't exist yet or other issues
			console.warn('[e2e] Category seed warning:', err);
		}
	}

	console.log('[e2e] Categories seeded.');

	await dbClient.end();
	console.log('[e2e] Database ready.\n');
}

export async function teardown(): Promise<void> {
	await testContainersTeardown();
}
