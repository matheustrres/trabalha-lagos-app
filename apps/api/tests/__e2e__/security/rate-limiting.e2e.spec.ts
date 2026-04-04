import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createAppFixture } from '../__helpers/app-fixture';

const REGISTER_URL = '/api/v1/auth/register';
const LOGIN_URL = '/api/v1/auth/login';
const JOBS_URL = '/api/v1/jobs';
const EMPLOYER_JOBS_URL = '/api/v1/employer/jobs';
const CATEGORIES_URL = '/api/v1/categories';

const CNPJ_VALID = '11222333000181';
const EMPLOYER_CNPJ_VALID = '11444777000161';
const EMPLOYER_CNPJ_VALID_2 = '11222333000181';

const createRegisterPayload = (suffix: string) => ({
	name: `Candidate ${suffix}`,
	phone: `22999${suffix.padStart(6, '0')}`,
	email: `candidate-${suffix}@trabalhalagos.com`,
	password: 'Senha@123',
	city: 'Cabo Frio',
	role: 'CANDIDATE' as const,
	document: CNPJ_VALID,
});

const createEmployerPayload = (suffix: string, document: string) => ({
	name: `Employer Tracker ${suffix}`,
	phone: `2299${suffix.padStart(7, '0')}`,
	email: `employer-${suffix}@trabalhalagos.com`,
	password: 'Senha@123',
	city: 'Cabo Frio',
	role: 'EMPLOYER' as const,
	document,
});

const hasHeaderWithPrefix = (
	headers: Record<string, string | string[] | undefined>,
	prefix: string,
): boolean => {
	return Object.keys(headers).some((header) => header.startsWith(prefix));
};

describe('Rate limiting (e2e)', () => {
	let app: INestApplication;
	const previousThrottleEnv = process.env['THROTTLE_ENABLED'];

	beforeAll(async () => {
		process.env['THROTTLE_ENABLED'] = 'true';
		({ app } = await createAppFixture({
			shouldClearAllDb: true,
			useInMemoryThrottleStorage: true,
		}));
	});

	afterAll(async () => {
		if (app) {
			await app.close();
		}

		if (previousThrottleEnv === undefined) {
			delete process.env['THROTTLE_ENABLED'];
			return;
		}

		process.env['THROTTLE_ENABLED'] = previousThrottleEnv;
	});

	it('limits POST /auth/login to 5 req/min per IP', async () => {
		const ip = '10.10.10.1';

		await request(app.getHttpServer())
			.post(REGISTER_URL)
			.set('x-forwarded-for', ip)
			.send(createRegisterPayload('900001'))
			.expect(201);

		for (let attempt = 0; attempt < 5; attempt++) {
			await request(app.getHttpServer())
				.post(LOGIN_URL)
				.set('x-forwarded-for', ip)
				.send({ phone: '22999900001', password: 'Senha@123' })
				.expect(200);
		}

		const limitedResponse = await request(app.getHttpServer())
			.post(LOGIN_URL)
			.set('x-forwarded-for', ip)
			.send({ phone: '22999900001', password: 'Senha@123' })
			.expect(429);

		expect(
			hasHeaderWithPrefix(limitedResponse.headers, 'x-ratelimit-limit'),
		).toBe(true);
		expect(
			hasHeaderWithPrefix(limitedResponse.headers, 'x-ratelimit-remaining'),
		).toBe(true);
		expect(
			hasHeaderWithPrefix(limitedResponse.headers, 'x-ratelimit-reset'),
		).toBe(true);
	});

	it('limits POST /auth/register to 3 req/min per IP', async () => {
		const ip = '10.10.10.2';

		for (let attempt = 0; attempt < 3; attempt++) {
			await request(app.getHttpServer())
				.post(REGISTER_URL)
				.set('x-forwarded-for', ip)
				.send(createRegisterPayload(`91000${attempt}`))
				.expect(201);
		}

		await request(app.getHttpServer())
			.post(REGISTER_URL)
			.set('x-forwarded-for', ip)
			.send(createRegisterPayload('910009'))
			.expect(429);
	});

	it('limits GET /jobs to 60 req/min per IP', async () => {
		const ip = '10.10.10.3';

		for (let attempt = 0; attempt < 60; attempt++) {
			await request(app.getHttpServer())
				.get(JOBS_URL)
				.set('x-forwarded-for', ip)
				.expect(200);
		}

		await request(app.getHttpServer())
			.get(JOBS_URL)
			.set('x-forwarded-for', ip)
			.expect(429);
	});

	it('keeps GET /categories permissive for bursty reads', async () => {
		const ip = '10.10.10.4';

		for (let attempt = 0; attempt < 80; attempt++) {
			await request(app.getHttpServer())
				.get(CATEGORIES_URL)
				.set('x-forwarded-for', ip)
				.expect(200);
		}
	});

	it('applies GET /employer/jobs limit by user, independent from request IP', async () => {
		const registerIp = '10.10.20.1';
		const firstBurstIp = '10.10.20.2';
		const secondBurstIp = '10.10.20.3';

		const employerResponse = await request(app.getHttpServer())
			.post(REGISTER_URL)
			.set('x-forwarded-for', registerIp)
			.send(createEmployerPayload('7777', EMPLOYER_CNPJ_VALID))
			.expect(201);

		const token = employerResponse.body.accessToken as string;

		for (let attempt = 0; attempt < 90; attempt++) {
			await request(app.getHttpServer())
				.get(EMPLOYER_JOBS_URL)
				.set('Authorization', `Bearer ${token}`)
				.set('x-forwarded-for', firstBurstIp)
				.expect(200);
		}

		await request(app.getHttpServer())
			.get(EMPLOYER_JOBS_URL)
			.set('Authorization', `Bearer ${token}`)
			.set('x-forwarded-for', secondBurstIp)
			.expect(429);
	});

	it('keeps buckets isolated for different users on same IP', async () => {
		const sharedIp = '10.10.30.10';

		const employerA = await request(app.getHttpServer())
			.post(REGISTER_URL)
			.set('x-forwarded-for', '10.10.30.1')
			.send(createEmployerPayload('7788', EMPLOYER_CNPJ_VALID))
			.expect(201);

		const employerB = await request(app.getHttpServer())
			.post(REGISTER_URL)
			.set('x-forwarded-for', '10.10.30.2')
			.send(createEmployerPayload('7799', EMPLOYER_CNPJ_VALID_2))
			.expect(201);

		const tokenA = employerA.body.accessToken as string;
		const tokenB = employerB.body.accessToken as string;

		for (let attempt = 0; attempt < 90; attempt++) {
			await request(app.getHttpServer())
				.get(EMPLOYER_JOBS_URL)
				.set('Authorization', `Bearer ${tokenA}`)
				.set('x-forwarded-for', sharedIp)
				.expect(200);
		}

		await request(app.getHttpServer())
			.get(EMPLOYER_JOBS_URL)
			.set('Authorization', `Bearer ${tokenA}`)
			.set('x-forwarded-for', sharedIp)
			.expect(429);

		await request(app.getHttpServer())
			.get(EMPLOYER_JOBS_URL)
			.set('Authorization', `Bearer ${tokenB}`)
			.set('x-forwarded-for', sharedIp)
			.expect(200);
	});
});
