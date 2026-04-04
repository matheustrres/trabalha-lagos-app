import type { INestApplication } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createAppFixture } from '../__helpers/app-fixture';

import { UsersRepository } from '@/modules/users/users.repository';

import type { Database } from '@/shared/modules/database/database.provider';
import {
	companies,
	interests,
	jobs,
	users,
} from '@/shared/modules/database/schema';

describe('UsersRepository (integration)', () => {
	let app: INestApplication;
	let db: Database;
	let usersRepository: UsersRepository;

	beforeAll(async () => {
		({ app, db } = await createAppFixture({ shouldClearAllDb: true }));
		usersRepository = app.get(UsersRepository);
	});

	afterAll(async () => {
		await app.close();
	});

	describe('create + findByPhone + findByEmail + findById', () => {
		it('creates a candidate user and finds by all lookup methods', async () => {
			const created = await usersRepository.create({
				name: 'João Candidate',
				phone: '22970000001',
				email: 'joao.candidate@email.com',
				passwordHash: '$argon2id$mock-hash',
				city: 'Cabo Frio',
				role: 'CANDIDATE',
			});

			expect(created.id).toBeDefined();
			expect(created.role).toBe('CANDIDATE');

			const byPhone = await usersRepository.findByPhone('22970000001');
			expect(byPhone?.id).toBe(created.id);

			const byEmail = await usersRepository.findByEmail(
				'joao.candidate@email.com',
			);
			expect(byEmail?.id).toBe(created.id);

			const byId = await usersRepository.findById(created.id);
			expect(byId?.phone).toBe('22970000001');
		});

		it('supports nullable email and still finds by phone/id', async () => {
			const created = await usersRepository.create({
				name: 'Maria Employer',
				phone: '22970000002',
				passwordHash: '$argon2id$mock-hash',
				city: 'Búzios',
				role: 'EMPLOYER',
			});

			expect(created.email).toBeNull();

			const byPhone = await usersRepository.findByPhone('22970000002');
			expect(byPhone?.id).toBe(created.id);

			const byId = await usersRepository.findById(created.id);
			expect(byId?.city).toBe('Búzios');
		});
	});

	describe('not found cases', () => {
		it('returns null for unknown phone/email/id', async () => {
			const byPhone = await usersRepository.findByPhone('22979999999');
			const byEmail = await usersRepository.findByEmail('ghost@email.com');
			const byId = await usersRepository.findById(
				'00000000-0000-0000-0000-000000000000',
			);

			expect(byPhone).toBeNull();
			expect(byEmail).toBeNull();
			expect(byId).toBeNull();
		});
	});

	describe('cascade delete relations', () => {
		it('deletes company, jobs and interests when employer user is deleted', async () => {
			const employer = await usersRepository.create({
				name: 'Empresa Cascade',
				phone: '22971111111',
				email: 'empresa.cascade@email.com',
				passwordHash: '$argon2id$mock-hash',
				city: 'Cabo Frio',
				role: 'EMPLOYER',
			});

			const [company] = await db
				.insert(companies)
				.values({
					userId: employer.id,
					name: 'Empresa Cascade',
					document: '11222333000181',
					city: 'Cabo Frio',
					whatsapp: '22971111111',
				})
				.returning({ id: companies.id });

			const [job] = await db
				.insert(jobs)
				.values({
					companyId: company!.id,
					title: 'Vaga Cascade',
					slug: `vaga-cascade-${Date.now()}`,
					description: 'Descrição longa para testar cascata de deleção.',
					categoryId: 1,
					contractType: 'CLT',
					city: 'Cabo Frio',
					address: 'Rua Teste, 123',
					location: sql`ST_SetSRID(ST_MakePoint(${-42.0187}, ${-22.8789}), 4326)`,
					whatsappContact: '22971111111',
					contactMethod: 'WHATSAPP',
					status: 'ACTIVE',
					expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
				})
				.returning({ id: jobs.id });

			const candidate = await usersRepository.create({
				name: 'Candidate Cascade',
				phone: '22972222222',
				email: 'candidate.cascade@email.com',
				passwordHash: '$argon2id$mock-hash',
				city: 'Búzios',
				role: 'CANDIDATE',
			});

			await db.insert(interests).values({
				userId: candidate.id,
				jobId: job!.id,
				name: 'Candidate Cascade',
				phone: '22972222222',
				city: 'Búzios',
			});

			await db.delete(users).where(eq(users.id, employer.id));

			const [companyAfterDelete] = await db
				.select({ id: companies.id })
				.from(companies)
				.where(eq(companies.id, company!.id));
			const [jobAfterDelete] = await db
				.select({ id: jobs.id })
				.from(jobs)
				.where(eq(jobs.id, job!.id));
			const [interestAfterDelete] = await db
				.select({ id: interests.id })
				.from(interests)
				.where(eq(interests.jobId, job!.id));

			expect(companyAfterDelete).toBeUndefined();
			expect(jobAfterDelete).toBeUndefined();
			expect(interestAfterDelete).toBeUndefined();
		});

		it('deletes candidate interests when candidate user is deleted', async () => {
			const employer = await usersRepository.create({
				name: 'Empresa Interesses',
				phone: '22973333333',
				email: 'empresa.interesses@email.com',
				passwordHash: '$argon2id$mock-hash',
				city: 'Cabo Frio',
				role: 'EMPLOYER',
			});

			const [company] = await db
				.insert(companies)
				.values({
					userId: employer.id,
					name: 'Empresa Interesses',
					document: '11444777000161',
					city: 'Cabo Frio',
					whatsapp: '22973333333',
				})
				.returning({ id: companies.id });

			const [job] = await db
				.insert(jobs)
				.values({
					companyId: company!.id,
					title: 'Vaga Candidate Cascade',
					slug: `vaga-candidate-cascade-${Date.now()}`,
					description: 'Descrição longa para testar cascata de interesse.',
					categoryId: 1,
					contractType: 'CLT',
					city: 'Cabo Frio',
					address: 'Rua Teste, 321',
					location: sql`ST_SetSRID(ST_MakePoint(${-42.0187}, ${-22.8789}), 4326)`,
					whatsappContact: '22973333333',
					contactMethod: 'WHATSAPP',
					status: 'ACTIVE',
					expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
				})
				.returning({ id: jobs.id });

			const candidate = await usersRepository.create({
				name: 'Candidate Delete Interest',
				phone: '22974444444',
				email: 'candidate.delete@email.com',
				passwordHash: '$argon2id$mock-hash',
				city: 'Arraial do Cabo',
				role: 'CANDIDATE',
			});

			const [createdInterest] = await db
				.insert(interests)
				.values({
					userId: candidate.id,
					jobId: job!.id,
					name: 'Candidate Delete Interest',
					phone: '22974444444',
					city: 'Arraial do Cabo',
				})
				.returning({ id: interests.id });

			await db.delete(users).where(eq(users.id, candidate.id));

			const [interestAfterDelete] = await db
				.select({ id: interests.id })
				.from(interests)
				.where(eq(interests.id, createdInterest!.id));

			expect(interestAfterDelete).toBeUndefined();
		});
	});
});
