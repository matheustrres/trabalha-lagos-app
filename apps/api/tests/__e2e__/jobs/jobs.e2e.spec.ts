import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createAppFixture } from '../__helpers/app-fixture';

const REGISTER_URL = '/api/v1/auth/register';
const JOBS_URL = '/api/v1/jobs';
const EMPLOYER_JOBS_URL = '/api/v1/employer/jobs';

// CNPJ fixo válido para testes
const CNPJ_VALID = '11222333000181';

const validEmployerPayload = {
	name: 'Empresa Teste',
	phone: '22999990001',
	password: 'senha@123',
	city: 'Cabo Frio',
	role: 'EMPLOYER',
	document: CNPJ_VALID,
};

const validCandidatePayload = {
	name: 'Candidato Teste',
	phone: '22999990002',
	password: 'senha@123',
	city: 'Cabo Frio',
	role: 'CANDIDATE',
	document: CNPJ_VALID,
};

const validJobPayload = {
	title: 'Atendente de Turismo',
	description:
		'Descrição detalhada da vaga com requisitos e benefícios... Precisamos de alguém com experiência em atendimento ao cliente.',
	categoryId: 1,
	contractType: 'CLT',
	city: 'Cabo Frio',
	address: 'Rua das Flores, 123',
	locationLng: -42.0187,
	locationLat: -22.8789,
	salaryMin: 200000,
	salaryMax: 300000,
	salaryHidden: false,
	whatsappContact: '22999999999',
	contactMethod: 'WHATSAPP',
	requirements: ['Experiência em atendimento ao cliente', 'Boa comunicação'],
};

describe('Jobs (e2e)', () => {
	let app: INestApplication;
	let employerToken: string;
	let candidateToken: string;

	beforeAll(async () => {
		({ app } = await createAppFixture({ shouldClearAllDb: true }));

		// Setup: criar empregador
		const employerRes = await request(app.getHttpServer())
			.post(REGISTER_URL)
			.send(validEmployerPayload)
			.expect(201);

		employerToken = employerRes.body.accessToken;

		// Setup: criar candidato
		const candidateRes = await request(app.getHttpServer())
			.post(REGISTER_URL)
			.send(validCandidatePayload)
			.expect(201);

		candidateToken = candidateRes.body.accessToken;
	});

	afterAll(async () => {
		await app.close();
	});

	// ─── GET /jobs (public) ───────────────────────────────────────────────────

	describe('GET /jobs', () => {
		it('returns 200 with empty array when no jobs exist', async () => {
			const res = await request(app.getHttpServer()).get(JOBS_URL).expect(200);
			expect(res.body).toEqual([]);
		});
	});

	// ─── POST /jobs (protected) ───────────────────────────────────────────────

	describe('POST /jobs', () => {
		it('returns 201 when employer creates a valid job', async () => {
			const res = await request(app.getHttpServer())
				.post(JOBS_URL)
				.set('Authorization', `Bearer ${employerToken}`)
				.send(validJobPayload)
				.expect(201);

			expect(res.body).toMatchObject({
				id: expect.any(String),
				title: 'Atendente de Turismo',
				status: 'ACTIVE',
			});
		});

		it('returns 401 when unauthenticated user tries to create job', async () => {
			await request(app.getHttpServer())
				.post(JOBS_URL)
				.send(validJobPayload)
				.expect(401);
		});

		it('returns 403 when candidate tries to create job', async () => {
			await request(app.getHttpServer())
				.post(JOBS_URL)
				.set('Authorization', `Bearer ${candidateToken}`)
				.send(validJobPayload)
				.expect(403);
		});
	});

	// ─── GET /jobs/:slug (public) ─────────────────────────────────────────────

	describe('GET /jobs/:slug', () => {
		it('returns 200 with job details', async () => {
			// Criar uma vaga primeiro
			const createRes = await request(app.getHttpServer())
				.post(JOBS_URL)
				.set('Authorization', `Bearer ${employerToken}`)
				.send(validJobPayload)
				.expect(201);

			const slug = createRes.body.slug;

			const res = await request(app.getHttpServer())
				.get(`${JOBS_URL}/${slug}`)
				.expect(200);

			expect(res.body).toMatchObject({
				slug,
				title: 'Atendente de Turismo',
			});
		});

		it('returns 404 when slug does not exist', async () => {
			await request(app.getHttpServer())
				.get(`${JOBS_URL}/slug-inexistente-12345`)
				.expect(404);
		});
	});

	// ─── GET /employer/jobs (protected) ───────────────────────────────────────

	describe('GET /employer/jobs', () => {
		it('returns 200 with employer jobs', async () => {
			const res = await request(app.getHttpServer())
				.get(EMPLOYER_JOBS_URL)
				.set('Authorization', `Bearer ${employerToken}`)
				.expect(200);

			expect(Array.isArray(res.body)).toBe(true);
		});

		it('returns 401 when unauthenticated', async () => {
			await request(app.getHttpServer()).get(EMPLOYER_JOBS_URL).expect(401);
		});

		it('returns 403 when candidate tries to access', async () => {
			await request(app.getHttpServer())
				.get(EMPLOYER_JOBS_URL)
				.set('Authorization', `Bearer ${candidateToken}`)
				.expect(403);
		});
	});
});
