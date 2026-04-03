import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
	getOptionsToken,
	getStorageToken,
	ThrottlerStorageService,
	type ThrottlerModuleOptions,
} from '@nestjs/throttler';
import { mock } from 'vitest-mock-extended';

import { cleanDatabase } from './database-cleaner';

import { AppModule } from '@/app.module';

import {
	DATABASE_TOKEN,
	type Database,
} from '@/shared/modules/database/database.provider';
import { EnvService } from '@/shared/modules/env/env.service';
import { getIpTracker } from '@/shared/utils/get-ip-tracker';

type CreateAppFixtureOptions = {
	shouldClearAllDb: boolean;
	useInMemoryThrottleStorage?: boolean;
};

export async function createAppFixture({
	shouldClearAllDb,
	useInMemoryThrottleStorage = false,
}: CreateAppFixtureOptions): Promise<{
	app: INestApplication;
	db: Database;
}> {
	const resolveEnvValue = (key: string) => {
		if (key === 'THROTTLE_ENABLED') {
			const value = process.env['THROTTLE_ENABLED'];

			if (!value) return false;

			return !['false', '0', 'off', 'no'].includes(value.toLowerCase());
		}

		if (key === 'REDIS_HOST') return process.env['REDIS_HOST'] || 'localhost';
		if (key === 'REDIS_PORT')
			return parseInt(process.env['REDIS_PORT'] || '6379', 10);
		if (key === 'REDIS_PASSWORD')
			return process.env['REDIS_PASSWORD'] || undefined;

		return process.env[key];
	};

	const envServiceMock = mock<EnvService>({
		getKey: (key: string) => resolveEnvValue(key) as never,
		getKeyOrThrow: (key: string) => {
			const value = resolveEnvValue(key);

			if (value === undefined || value === null || value === '') {
				throw new Error(`Missing env key: ${key}`);
			}

			return value as never;
		},
	});

	const moduleBuilder = Test.createTestingModule({
		imports: [AppModule],
	})
		.overrideProvider(EnvService)
		.useValue(envServiceMock);

	if (useInMemoryThrottleStorage) {
		const throttlerOptions: ThrottlerModuleOptions = {
			throttlers: [
				{ name: 'short', ttl: 1000, limit: 9999 },
				{ name: 'medium', ttl: 60000, limit: 60 },
			],
			setHeaders: true,
			getTracker: getIpTracker,
		};

		moduleBuilder
			.overrideProvider(getStorageToken())
			.useValue(new ThrottlerStorageService())
			.overrideProvider(getOptionsToken())
			.useValue(throttlerOptions);
	}

	const module = await moduleBuilder.compile();

	const app = module.createNestApplication();

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	app.setGlobalPrefix('api/v1');

	await app.init();

	const db = module.get<Database>(DATABASE_TOKEN);

	if (shouldClearAllDb) {
		await cleanDatabase(db);
	}

	return { app, db };
}
