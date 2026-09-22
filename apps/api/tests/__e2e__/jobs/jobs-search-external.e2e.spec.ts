import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { createAppFixture } from '../__helpers/app-fixture';
import { cleanDatabase } from '../__helpers/database-cleaner';

import type { Database } from '@/shared/modules/database/database.provider';
import {
	categories,
	companies,
	externalJobs,
	jobs,
	users,
	type NewExternalJobSchema,
} from '@/shared/modules/database/schema';

const JOBS_URL = '/api/v1/jobs';
const CABO_FRIO = { lat: -22.8789, lng: -42.0187 };
const ARARUAMA = { lat: -22.8729, lng: -42.3431 };

describe('Combined jobs search (e2e)', () => {
	let app: INestApplication;
	let db: Database;
	let companyId: string;
	let categoryId: number;

	beforeAll(async () => {
		({ app, db } = await createAppFixture({
			shouldClearAllDb: true,
			useInMemoryThrottleStorage: true,
		}));
	});

	beforeEach(async () => {
		await cleanDatabase(db);

		const [category] = await db
			.select({ id: categories.id })
			.from(categories)
			.limit(1);
		if (!category) throw new Error('E2E category fixture is missing');
		categoryId = category.id;

		const [user] = await db
			.insert(users)
			.values({
				name: 'Empregador da busca combinada',
				phone: '22999991001',
				passwordHash: '$argon2id$e2e-placeholder',
				role: 'EMPLOYER',
				city: 'Cabo Frio',
			})
			.returning({ id: users.id });
		if (!user) throw new Error('E2E user fixture was not created');

		const [company] = await db
			.insert(companies)
			.values({
				userId: user.id,
				name: 'Empresa interna E2E',
				city: 'Cabo Frio',
				plan: 'PRO',
			})
			.returning({ id: companies.id });
		if (!company) throw new Error('E2E company fixture was not created');
		companyId = company.id;
	});

	afterAll(async () => {
		await app.close();
	});

	const insertInternalJob = async (
		title: string,
		createdAt: Date,
	): Promise<void> => {
		await db.insert(jobs).values({
			companyId,
			title,
			slug: title.toLowerCase().replaceAll(' ', '-'),
			description: 'Vaga interna usada no teste da busca combinada.',
			categoryId,
			contractType: 'CLT',
			city: 'Cabo Frio',
			location: { x: CABO_FRIO.lng, y: CABO_FRIO.lat },
			status: 'ACTIVE',
			expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			createdAt,
			updatedAt: createdAt,
		});
	};

	const insertExternalJob = async (
		externalId: string,
		overrides: Partial<NewExternalJobSchema> = {},
	): Promise<void> => {
		const now = new Date();
		await db.insert(externalJobs).values({
			source: 'SYNTHETIC',
			externalId,
			title: `Vaga externa ${externalId}`,
			descriptionSnippet: 'Descrição externa para integração.',
			company: 'Empresa externa E2E',
			redirectUrl: `https://example.invalid/${externalId}`,
			categoryOriginal: 'Comércio e varejo',
			contractTypeOriginal: 'CLT',
			salaryPredicted: false,
			locationText: 'Cabo Frio, Rio de Janeiro',
			locationArea: ['Cabo Frio', 'Rio de Janeiro', 'Brasil'],
			city: 'cabo-frio',
			location: { x: CABO_FRIO.lng, y: CABO_FRIO.lat },
			publishedAt: now,
			status: 'ACTIVE',
			firstSeenAt: now,
			lastSeenAt: now,
			expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
			...overrides,
		});
	};

	it('returns a sanitized INTERNAL | EXTERNAL union and blocks unlicensed sources', async () => {
		await insertInternalJob(
			'Vaga interna permitida',
			new Date(Date.now() - 2 * 60 * 60 * 1000),
		);
		await insertExternalJob('synthetic-allowed', {
			title: '<b>Atendente externo</b>',
			descriptionSnippet: 'Descrição\u001F sanitizada',
			redirectUrl: 'javascript:alert(1)',
		});
		await insertExternalJob('adzuna-blocked', {
			source: 'ADZUNA',
			title: 'Não deve ser publicada',
		});

		const response = await request(app.getHttpServer())
			.get(JOBS_URL)
			.query({ sort: 'recent' })
			.expect(200);

		expect(response.body.meta).toEqual({ total: 2, page: 1, limit: 20 });
		expect(
			response.body.data.map((job: { sourceType: string }) => job.sourceType),
		).toEqual(['EXTERNAL', 'INTERNAL']);
		expect(response.body.data[0]).toMatchObject({
			sourceType: 'EXTERNAL',
			externalSource: 'SYNTHETIC',
			title: 'Atendente externo',
			description: 'Descrição sanitizada',
			redirectUrl: null,
		});
		expect(
			response.body.data.some(
				(job: { title: string }) => job.title === 'Não deve ser publicada',
			),
		).toBe(false);
	});

	it('applies global ordering and pagination across both sources', async () => {
		const now = Date.now();
		await insertExternalJob('newest', {
			publishedAt: new Date(now - 60 * 60 * 1000),
		});
		await insertInternalJob(
			'Vaga interna intermediária',
			new Date(now - 2 * 60 * 60 * 1000),
		);
		await insertExternalJob('oldest', {
			publishedAt: new Date(now - 3 * 60 * 60 * 1000),
		});

		const firstPage = await request(app.getHttpServer())
			.get(JOBS_URL)
			.query({ sort: 'recent', page: 1, limit: 2 })
			.expect(200);
		const secondPage = await request(app.getHttpServer())
			.get(JOBS_URL)
			.query({ sort: 'recent', page: 2, limit: 2 })
			.expect(200);

		expect(firstPage.body.meta.total).toBe(3);
		expect(
			firstPage.body.data.map((job: { title: string }) => job.title),
		).toEqual(['Vaga externa newest', 'Vaga interna intermediária']);
		expect(
			secondPage.body.data.map((job: { title: string }) => job.title),
		).toEqual(['Vaga externa oldest']);
	});

	it('filters external jobs by city, radius, status and expiration', async () => {
		await insertExternalJob('valid-cabo-frio');
		await insertExternalJob('outside-radius', {
			city: 'araruama',
			locationText: 'Araruama, Rio de Janeiro',
			location: { x: ARARUAMA.lng, y: ARARUAMA.lat },
		});
		await insertExternalJob('paused', { status: 'PAUSED' });
		await insertExternalJob('expired', {
			expiresAt: new Date(Date.now() - 60 * 1000),
		});

		const response = await request(app.getHttpServer())
			.get(JOBS_URL)
			.query({
				city: 'Cabo Frio',
				lat: CABO_FRIO.lat,
				lng: CABO_FRIO.lng,
				radius: 5,
			})
			.expect(200);

		expect(response.body.meta.total).toBe(1);
		expect(response.body.data).toEqual([
			expect.objectContaining({
				sourceType: 'EXTERNAL',
				title: 'Vaga externa valid-cabo-frio',
				city: 'cabo-frio',
				distanceKm: expect.any(Number),
			}),
		]);
	});

	it('does not publish synthetic external jobs in production', async () => {
		await insertExternalJob('production-blocked');
		const previousNodeEnv = process.env['NODE_ENV'];

		try {
			process.env['NODE_ENV'] = 'production';
			const response = await request(app.getHttpServer())
				.get(JOBS_URL)
				.expect(200);

			expect(response.body).toEqual({
				data: [],
				meta: { total: 0, page: 1, limit: 20 },
			});
		} finally {
			if (previousNodeEnv === undefined) delete process.env['NODE_ENV'];
			else process.env['NODE_ENV'] = previousNodeEnv;
		}
	});
});
