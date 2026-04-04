import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createAppFixture } from '../__helpers/app-fixture';

const REGISTER_URL = '/api/v1/auth/register';
const JOBS_URL = '/api/v1/jobs';
const COMPANIES_URL = '/api/v1/companies';

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

const updateCompanyPayload = {
	name: 'Nome Atualizado',
	segment: 'Turismo',
	whatsapp: '22999990002',
};

describe('Companies (e2e)', () => {
	let app: INestApplication;
	let employerToken: string;
	let companyId: string;

	beforeAll(async () => {
		({ app } = await createAppFixture({ shouldClearAllDb: true }));

		// Setup: criar empregador e primeiro job (company é criada automaticamente)
		const employerRes = await request(app.getHttpServer())
			.post(REGISTER_URL)
			.send(validEmployerPayload)
			.expect(201);

		employerToken = employerRes.body.accessToken;

		const jobRes = await request(app.getHttpServer())
			.post(JOBS_URL)
			.set('Authorization', `Bearer ${employerToken}`)
			.send(validJobPayload)
			.expect(201);

		companyId = jobRes.body.companyId;
	});

	afterAll(async () => {
		await app.close();
	});

	// ─── GET /companies/me (protected) ───────────────────────────────────────────

	describe('GET /companies/me', () => {
		it('returns 200 with employer company data', async () => {
			const res = await request(app.getHttpServer())
				.get(`${COMPANIES_URL}/me`)
				.set('Authorization', `Bearer ${employerToken}`)
				.expect(200);

			expect(res.body).toMatchObject({
				id: expect.any(String),
				name: 'Empresa Teste',
			});
		});
	});

	// ─── GET /companies/:id (public) ─────────────────────────────────────────────

	describe('GET /companies/:id', () => {
		it('returns 200 with public company profile', async () => {
			const res = await request(app.getHttpServer())
				.get(`${COMPANIES_URL}/${companyId}`)
				.expect(200);

			expect(res.body).toMatchObject({
				id: companyId,
				name: 'Empresa Teste',
			});
		});
	});

	// ─── PATCH /companies/:id (protected) ───────────────────────────────────────

	describe('PATCH /companies/:id', () => {
		it('returns 200 when employer updates company profile', async () => {
			const res = await request(app.getHttpServer())
				.patch(`${COMPANIES_URL}/${companyId}`)
				.set('Authorization', `Bearer ${employerToken}`)
				.send(updateCompanyPayload)
				.expect(200);

			expect(res.body).toMatchObject({
				id: companyId,
				name: 'Nome Atualizado',
			});
		});
	});
});
