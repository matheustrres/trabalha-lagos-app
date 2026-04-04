import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createAppFixture } from '../__helpers/app-fixture';

const REGISTER_URL = '/api/v1/auth/register';
const INTERESTS_URL = '/api/v1/interests';
const EMPLOYER_INTERESTS_URL = '/api/v1/employer/interests';

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
		'Descrição detalhada da vaga com requisitos e benefícios... Precisamos de alguém com experiência em atendimento.',
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
	requirements: ['Experiência em atendimento'],
};

const interestPayload = {
	name: 'João Candidate',
	phone: '22999990005',
	city: 'Cabo Frio',
};

describe('Interests (e2e)', () => {
	let app: INestApplication;
	let employerToken: string;
	let jobId: string;

	beforeAll(async () => {
		({ app } = await createAppFixture({ shouldClearAllDb: true }));

		// Setup: criar empregador e vaga
		const employerRes = await request(app.getHttpServer())
			.post(REGISTER_URL)
			.send(validEmployerPayload)
			.expect(201);

		employerToken = employerRes.body.accessToken;

		const jobRes = await request(app.getHttpServer())
			.post('/api/v1/jobs')
			.set('Authorization', `Bearer ${employerToken}`)
			.send(validJobPayload)
			.expect(201);

		jobId = jobRes.body.id;
	});

	afterAll(async () => {
		await app.close();
	});

	// ─── POST /jobs/:jobId/interest (public) ────────────────────────────────────

	describe('POST /jobs/:jobId/interest', () => {
		it('returns 201 when candidate demonstrates interest in a job', async () => {
			const res = await request(app.getHttpServer())
				.post(`/api/v1/jobs/${jobId}/interest`)
				.send(interestPayload)
				.expect(201);

			expect(res.body).toMatchObject({
				id: expect.any(String),
				jobId,
				name: 'João Candidate',
				phone: '22999990005',
				city: 'Cabo Frio',
				status: 'SENT',
			});
		});
	});

	// ─── GET /employer/interests (protected) ────────────────────────────────────

	describe('GET /employer/interests', () => {
		it('returns 200 with list of interests for employer jobs', async () => {
			const res = await request(app.getHttpServer())
				.get(EMPLOYER_INTERESTS_URL)
				.set('Authorization', `Bearer ${employerToken}`)
				.expect(200);

			expect(res.body).toMatchObject({
				data: expect.arrayContaining([
					expect.objectContaining({
						id: expect.any(String),
						jobId,
						candidateName: 'João Candidate',
						status: 'SENT',
					}),
				]),
			});
		});

		it('returns 200 with filtered interests by status', async () => {
			const res = await request(app.getHttpServer())
				.get(`${EMPLOYER_INTERESTS_URL}?status=SENT`)
				.set('Authorization', `Bearer ${employerToken}`)
				.expect(200);

			expect(res.body.data).toHaveLength(1);
			expect(res.body.data[0].status).toBe('SENT');
		});

		it('returns 200 with filtered interests by jobId', async () => {
			const res = await request(app.getHttpServer())
				.get(`${EMPLOYER_INTERESTS_URL}?jobId=${jobId}`)
				.set('Authorization', `Bearer ${employerToken}`)
				.expect(200);

			expect(res.body.data).toHaveLength(1);
			expect(res.body.data[0].jobId).toBe(jobId);
		});
	});

	// ─── PATCH /interests/:id/status (protected) ───────────────────────────────

	describe('PATCH /interests/:id/status', () => {
		let interestId: string;

		beforeAll(async () => {
			// Obter o ID do interesse criado
			const interestsRes = await request(app.getHttpServer())
				.get(EMPLOYER_INTERESTS_URL)
				.set('Authorization', `Bearer ${employerToken}`)
				.expect(200);

			interestId = interestsRes.body.data[0].id;
		});

		it('returns 200 when employer updates interest status', async () => {
			const res = await request(app.getHttpServer())
				.patch(`${INTERESTS_URL}/${interestId}/status`)
				.set('Authorization', `Bearer ${employerToken}`)
				.send({ status: 'CONTACTED' })
				.expect(200);

			expect(res.body).toMatchObject({
				id: interestId,
				status: 'CONTACTED',
			});
		});
	});
});
