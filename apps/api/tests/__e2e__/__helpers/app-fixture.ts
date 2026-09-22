import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import {
	getOptionsToken,
	getStorageToken,
	ThrottlerStorageService,
	type ThrottlerModuleOptions,
} from '@nestjs/throttler';

import { cleanDatabase } from './database-cleaner';

import { AppModule } from '@/app.module';

import { GlobalThrottlerGuard } from '@/common/guards/global-throttler.guard';

import {
	DATABASE_TOKEN,
	type Database,
} from '@/shared/modules/database/database.provider';
import type { EnvService } from '@/shared/modules/env/env.service';
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
	const httpAdapter = new ExpressAdapter();
	const httpAdapterHost = new HttpAdapterHost();
	httpAdapterHost.httpAdapter = httpAdapter;
	const moduleBuilder = Test.createTestingModule({
		imports: [AppModule],
	})
		.overrideProvider(HttpAdapterHost)
		.useValue(httpAdapterHost);

	if (useInMemoryThrottleStorage) {
		const throttlerOptions: ThrottlerModuleOptions = {
			throttlers: [
				{ name: 'short', ttl: 1000, limit: 9999 },
				{ name: 'medium', ttl: 60000, limit: 60 },
			],
			setHeaders: true,
			getTracker: getIpTracker,
		};
		const throttleStorage = new ThrottlerStorageService();
		const throttleEnabledEnv = {
			getKey: (key: string) => key === 'THROTTLE_ENABLED',
		};

		moduleBuilder
			.overrideProvider(getStorageToken())
			.useValue(throttleStorage)
			.overrideProvider(getOptionsToken())
			.useValue(throttlerOptions)
			.overrideProvider(GlobalThrottlerGuard)
			.useValue(
				new GlobalThrottlerGuard(
					throttlerOptions,
					throttleStorage,
					throttleEnabledEnv as unknown as EnvService,
				),
			);
	}

	const module = await moduleBuilder.compile();

	const app = module.createNestApplication(httpAdapter);

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
