import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createAppFixture } from '../__helpers/app-fixture';

const CATEGORIES_URL = '/api/v1/categories';

describe('Categories (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		({ app } = await createAppFixture({ shouldClearAllDb: true }));
	});

	afterAll(async () => {
		await app.close();
	});

	describe('GET /categories', () => {
		it('returns 200 and allows unauthenticated access to public route', async () => {
			const res = await request(app.getHttpServer())
				.get(CATEGORIES_URL)
				.expect(200);

			expect(Array.isArray(res.body)).toBe(true);
		});
	});
});
