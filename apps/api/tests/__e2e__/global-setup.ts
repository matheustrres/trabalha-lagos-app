import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Client } from 'pg';

export async function setup(): Promise<void> {
	// Ensure JWT secrets are set for tests
	process.env['JWT_SECRET'] =
		process.env['JWT_SECRET'] || 'test-jwt-secret-long-enough-32-chars!!';
	process.env['JWT_REFRESH_SECRET'] =
		process.env['JWT_REFRESH_SECRET'] ||
		'test-jwt-refresh-secret-long-enough-32!!';

	const databaseUrl = process.env['DATABASE_URL'];
	if (!databaseUrl) throw new Error('[e2e] DATABASE_URL is required');

	const pgDatabase = process.env['PG_DATABASE'] ?? 'trabalha_lagos_test_db';
	const pgUser = process.env['PG_USER'];
	const pgPassword = process.env['PG_PASSWORD'];
	const pgHost = process.env['PG_HOST'] ?? 'localhost';
	const pgPort = process.env['PG_PORT'] ?? '5432';

	// ── Step 1: Ensure the test database exists ───────────────────────────────
	const adminUrl = `postgresql://${pgUser}:${pgPassword}@${pgHost}:${pgPort}/postgres`;
	const adminClient = new Client({ connectionString: adminUrl });
	await adminClient.connect();

	const { rowCount } = await adminClient.query(
		`SELECT 1 FROM pg_database WHERE datname = $1`,
		[pgDatabase],
	);

	if (!rowCount) {
		console.log(`\n[e2e] Creating test database "${pgDatabase}"...`);
		await adminClient.query(`CREATE DATABASE "${pgDatabase}"`);
	}

	await adminClient.end();

	// ── Step 2: Run migrations on the test database ───────────────────────────
	const dbClient = new Client({ connectionString: databaseUrl });
	await dbClient.connect();

	console.log('[e2e] Running Drizzle migrations...');

	const migrationSql = readFileSync(
		join(
			process.cwd(),
			'src/shared/modules/database/migrations/0000_chilly_loa.sql',
		),
		'utf-8',
	);

	const statements = migrationSql
		.split('--> statement-breakpoint')
		.map((s) => s.trim())
		.filter(Boolean);

	for (const statement of statements) {
		try {
			await dbClient.query(statement);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : String(err);
			// Ignore "already exists" errors for idempotency
			if (!message.includes('already exists')) throw err;
		}
	}

	await dbClient.end();
	console.log('[e2e] Database ready.\n');
}

export async function teardown(): Promise<void> {
	// Using a persistent local test database — nothing to stop
}
