import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { cleanDatabase } from './database-cleaner';

import { AppModule } from '@/app.module';

import {
	DATABASE_TOKEN,
	type Database,
} from '@/shared/modules/database/database.provider';

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
	}).compile();

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
