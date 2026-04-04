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
	email: 'empresa@trabalhalagos.com',
	password: 'Senha@123',
	city: 'Cabo Frio',
	role: 'EMPLOYER',
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

	beforeAll(async () => {
		({ app } = await createAppFixture({ shouldClearAllDb: true }));

		// Setup: criar empregador
		const employerRes = await request(app.getHttpServer())
			.post(REGISTER_URL)
			.send(validEmployerPayload)
			.expect(201);

		employerToken = employerRes.body.accessToken;
	});

	afterAll(async () => {
		await app.close();
	});

	// ─── GET /jobs (public) ───────────────────────────────────────────────────

	describe('GET /jobs', () => {
		it('returns 200 with empty paginated result when no jobs exist', async () => {
			const res = await request(app.getHttpServer()).get(JOBS_URL).expect(200);
			expect(res.body).toEqual({
				data: [],
				meta: {
					total: 0,
					page: 1,
					limit: 20,
				},
			});
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
	});

	// ─── PATCH /jobs/:id (protected) ─────────────────────────────────────────

	describe('PATCH /jobs/:id', () => {
		it('returns 200 with updated job when owner edits', async () => {
			// Buscar uma vaga existente do empregador (criada nos testes anteriores)
			const listRes = await request(app.getHttpServer())
				.get(EMPLOYER_JOBS_URL)
				.set('Authorization', `Bearer ${employerToken}`)
				.expect(200);

			const jobs = listRes.body;
			expect(jobs.length).toBeGreaterThan(0);

			const jobId = jobs[0].id;

			// Editar a vaga com payload válido (campos opcionais)
			const res = await request(app.getHttpServer())
				.patch(`${JOBS_URL}/${jobId}`)
				.set('Authorization', `Bearer ${employerToken}`)
				.send({
					title: 'Título Atualizado',
					description:
						'Descrição atualizada da vaga com novos requisitos e benefícios.',
				})
				.expect(200);

			expect(res.body).toMatchObject({
				id: jobId,
				title: 'Título Atualizado',
				description:
					'Descrição atualizada da vaga com novos requisitos e benefícios.',
			});
		});
	});

	// ─── PATCH /jobs/:id/status (protected) ───────────────────────────────────

	describe('PATCH /jobs/:id/status', () => {
		it('returns 200 with job with new status when owner changes status', async () => {
			// Buscar uma vaga existente do empregador (criada nos testes anteriores)
			const listRes = await request(app.getHttpServer())
				.get(EMPLOYER_JOBS_URL)
				.set('Authorization', `Bearer ${employerToken}`)
				.expect(200);

			const jobs = listRes.body;
			expect(jobs.length).toBeGreaterThan(0);

			const jobId = jobs[0].id;

			// Alterar status da vaga
			const res = await request(app.getHttpServer())
				.patch(`${JOBS_URL}/${jobId}/status`)
				.set('Authorization', `Bearer ${employerToken}`)
				.send({ status: 'CLOSED' })
				.expect(200);

			expect(res.body).toMatchObject({
				id: jobId,
				status: 'CLOSED',
			});
		});
	});
});
