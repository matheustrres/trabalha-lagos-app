import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { mock } from 'vitest-mock-extended';

import { cleanDatabase } from './database-cleaner';

import { AppModule } from '@/app.module';

import {
	DATABASE_TOKEN,
	type Database,
} from '@/shared/modules/database/database.provider';
import { EnvService } from '@/shared/modules/env/env.service';

type CreateAppFixtureOptions = {
	shouldClearAllDb: boolean;
};

export async function createAppFixture({
	shouldClearAllDb,
}: CreateAppFixtureOptions): Promise<{
	app: INestApplication;
	db: Database;
}> {
	const module = await Test.createTestingModule({
		imports: [AppModule],
	})
		.useMocker((token) => {
			// Mock EnvService so BullModule can use it in forRootAsync factory
			if (token === EnvService) {
				return mock<EnvService>({
					getKey: (key: string) => {
						if (key === 'REDIS_HOST') return 'localhost';
						if (key === 'REDIS_PORT') return 6379;
						if (key === 'REDIS_PASSWORD') return undefined;
						return undefined;
					},
				});
			}
			return null;
		})
		.compile();

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
