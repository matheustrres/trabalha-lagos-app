import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { categories } from './schema/categories';

const CATEGORIES = [
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

async function main() {
	const pool = new Pool({ connectionString: process.env['DATABASE_URL'] });
	const db = drizzle(pool);

	console.log('Seeding categories...');

	await db
		.insert(categories)
		.values(CATEGORIES)
		.onConflictDoNothing({ target: categories.slug });

	console.log(`Seeded ${CATEGORIES.length} categories.`);

	await pool.end();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
