import { execSync } from 'node:child_process';

import {
	PostgreSqlContainer,
	StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';

import type { E2eEnvironment } from './e2e-context';

let pgContainer: StartedPostgreSqlContainer;
let redisContainer: StartedRedisContainer;

export async function setup(): Promise<E2eEnvironment> {
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
	const redisHost = redisContainer.getHost();

	const environment: E2eEnvironment = {
		DATABASE_URL: databaseUrl,
		PG_USER: pgContainer.getUsername(),
		PG_PASSWORD: pgContainer.getPassword(),
		PG_HOST: pgContainer.getHost(),
		PG_PORT: String(pgContainer.getFirstMappedPort()),
		PG_DATABASE: pgContainer.getDatabase(),
		REDIS_HOST: redisHost === 'localhost' ? '127.0.0.1' : redisHost,
		REDIS_PORT: String(redisContainer.getMappedPort(6379)),
		REDIS_PASSWORD: '',
	};

	Object.assign(process.env, environment);

	console.log('[e2e] Running drizzle-kit migrate...');

	execSync('npx drizzle-kit migrate', {
		cwd: process.cwd(),
		stdio: 'inherit',
		env: { ...process.env },
	});

	console.log('[e2e] Environment ready.\n');

	return environment;
}

export async function teardown(): Promise<void> {
	console.log('\n[e2e] Stopping containers...');
	await Promise.all([pgContainer?.stop(), redisContainer?.stop()]);
	console.log('[e2e] Containers stopped.');
}
