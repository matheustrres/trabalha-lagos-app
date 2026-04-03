import { execSync } from 'node:child_process';

import {
	PostgreSqlContainer,
	StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';

let pgContainer: StartedPostgreSqlContainer;
let redisContainer: StartedRedisContainer;

export async function setup(): Promise<void> {
	console.log('\n[e2e] Starting containers...');

	[pgContainer, redisContainer] = await Promise.all([
		new PostgreSqlContainer('postgis/postgis:16-3.5-alpine')
			.withDatabase('trabalha_lagos_test')
			.withUsername('test')
			.withPassword('test')
			.start(),
		new RedisContainer('redis:alpine').start(),
	]);

	const databaseUrl = pgContainer.getConnectionUri();

	process.env['DATABASE_URL'] = databaseUrl;
	process.env['PG_USER'] = pgContainer.getUsername();
	process.env['PG_PASSWORD'] = pgContainer.getPassword();
	process.env['PG_HOST'] = pgContainer.getHost();
	process.env['PG_PORT'] = String(pgContainer.getFirstMappedPort());
	process.env['PG_DATABASE'] = pgContainer.getDatabase();
	process.env['REDIS_HOST'] = redisContainer.getHost();
	process.env['REDIS_PORT'] = String(redisContainer.getMappedPort(6379));
	process.env['REDIS_PASSWORD'] = '';

	console.log('[e2e] Running drizzle-kit migrate...');

	execSync('npx drizzle-kit migrate', {
		cwd: process.cwd(),
		stdio: 'inherit',
		env: { ...process.env },
	});

	console.log('[e2e] Environment ready.\n');
}

export async function teardown(): Promise<void> {
	await Promise.all([pgContainer?.stop(), redisContainer?.stop()]);
}
