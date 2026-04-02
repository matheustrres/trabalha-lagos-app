import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createAppFixture } from '../__helpers/app-fixture';

const REGISTER_URL = '/api/v1/auth/register';
const LOGIN_URL = '/api/v1/auth/login';
const REFRESH_URL = '/api/v1/auth/refresh';

// CNPJ fixo válido para testes (usado para CANDIDATE que não precisa ter CNPJ real)
const CNPJ_VALID = '11222333000181';

const validRegisterPayload = {
	name: 'Maria Souza',
	phone: '22999990001',
	password: 'senha@123',
	city: 'Cabo Frio',
	role: 'CANDIDATE',
	document: CNPJ_VALID,
};

describe('Auth (e2e)', () => {
	let app: INestApplication;

	beforeAll(async () => {
		({ app } = await createAppFixture({ shouldClearAllDb: true }));
	});

	afterAll(async () => {
		await app.close();
	});

	// ─── Register ──────────────────────────────────────────────────────────────

	describe('POST /auth/register', () => {
		it('returns 201 with accessToken, refreshToken and user data', async () => {
			const res = await request(app.getHttpServer())
				.post(REGISTER_URL)
				.send(validRegisterPayload)
				.expect(201);

			expect(res.body).toMatchObject({
				accessToken: expect.any(String),
				refreshToken: expect.any(String),
				user: {
					id: expect.any(String),
					name: 'Maria Souza',
					phone: '22999990001',
					role: 'CANDIDATE',
				},
			});
		});
	});

	// ─── Login ─────────────────────────────────────────────────────────────────

	describe('POST /auth/login', () => {
		it('returns 200 with tokens when credentials are valid', async () => {
			const res = await request(app.getHttpServer())
				.post(LOGIN_URL)
				.send({ phone: '22999990001', password: 'senha@123' })
				.expect(200);

			expect(res.body).toMatchObject({
				accessToken: expect.any(String),
				refreshToken: expect.any(String),
				user: {
					phone: '22999990001',
					role: 'CANDIDATE',
				},
			});
		});
	});

	// ─── Refresh ───────────────────────────────────────────────────────────────

	describe('POST /auth/refresh', () => {
		it('returns 200 with a new token pair when refresh token is valid', async () => {
			const loginRes = await request(app.getHttpServer())
				.post(LOGIN_URL)
				.send({ phone: '22999990001', password: 'senha@123' })
				.expect(200);

			const { refreshToken } = loginRes.body as {
				refreshToken: string;
			};

			const res = await request(app.getHttpServer())
				.post(REFRESH_URL)
				.send({ refreshToken })
				.expect(200);

			expect(res.body).toMatchObject({
				accessToken: expect.any(String),
				refreshToken: expect.any(String),
			});
		});
	});
});
