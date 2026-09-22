import { type INestApplication, ConflictException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { uuidv7 } from 'uuidv7';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createAppFixture } from '../__helpers/app-fixture';

import { InterestsRepository } from '@/modules/interests/interests.repository';

import type { Database } from '@/shared/modules/database/database.provider';
import { companies, jobs, users } from '@/shared/modules/database/schema';

describe('InterestsRepository (integration)', () => {
	let app: INestApplication;
	let db: Database;
	let interestsRepository: InterestsRepository;

	beforeAll(async () => {
		({ app, db } = await createAppFixture({ shouldClearAllDb: true }));
		interestsRepository = app.get(InterestsRepository);
	});

	afterAll(async () => {
		await app.close();
	});

	async function createEmployer(
		suffix: string,
	): Promise<{ userId: string; companyId: string }> {
		const [user] = await db
			.insert(users)
			.values({
				name: `Employer ${suffix}`,
				phone: `2299911${suffix}`,
				email: `employer-${suffix}@email.com`,
				passwordHash: '$argon2id$mock-hash',
				role: 'EMPLOYER',
				city: 'Cabo Frio',
			})
			.returning({ id: users.id });

		const [company] = await db
			.insert(companies)
			.values({
				userId: user!.id,
				name: `Empresa ${suffix}`,
				document: '11222333000181',
				city: 'Cabo Frio',
				whatsapp: `2299911${suffix}`,
				plan: 'PRO',
			})
			.returning({ id: companies.id });

		return { userId: user!.id, companyId: company!.id };
	}

	async function createCandidate(suffix: string): Promise<{ userId: string }> {
		const [user] = await db
			.insert(users)
			.values({
				name: `Candidate ${suffix}`,
				phone: `2299922${suffix}`,
				email: `candidate-${suffix}@email.com`,
				passwordHash: '$argon2id$mock-hash',
				role: 'CANDIDATE',
				city: 'Búzios',
			})
			.returning({ id: users.id });

		return { userId: user!.id };
	}

	async function createJob(
		companyId: string,
		suffix: string,
	): Promise<{ jobId: string }> {
		const [job] = await db
			.insert(jobs)
			.values({
				companyId,
				title: `Vaga ${suffix}`,
				slug: `vaga-${suffix}-${Date.now()}`,
				description: 'Descrição longa da vaga para testes de integração.',
				categoryId: 1,
				contractType: 'CLT',
				city: 'Cabo Frio',
				address: 'Rua Teste, 123',
				location: sql`ST_SetSRID(ST_MakePoint(${-42.0187}, ${-22.8789}), 4326)`,
				whatsappContact: `2299933${suffix}`,
				contactMethod: 'WHATSAPP',
				status: 'ACTIVE',
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			})
			.returning({ id: jobs.id });

		return { jobId: job!.id };
	}

	describe('create + findByUserIdAndJobId + findById', () => {
		it('creates and retrieves an interest for a logged user', async () => {
			const { companyId } = await createEmployer('0001');
			const { userId } = await createCandidate('0001');
			const { jobId } = await createJob(companyId, '0001');

			const created = await interestsRepository.create({
				userId,
				jobId,
				name: 'João Candidate',
				phone: '22999990005',
				city: 'Cabo Frio',
			});

			expect(created.status).toBe('SENT');

			const foundByPair = await interestsRepository.findByUserIdAndJobId(
				userId,
				jobId,
			);
			expect(foundByPair?.id).toBe(created.id);

			const foundById = await interestsRepository.findById(created.id);
			expect(foundById?.name).toBe('João Candidate');
		});

		it('maps unique constraint violations to ConflictException', async () => {
			const { companyId } = await createEmployer('0002');
			const { userId } = await createCandidate('0002');
			const { jobId } = await createJob(companyId, '0002');

			await interestsRepository.create({
				userId,
				jobId,
				name: 'Maria Candidate',
				phone: '22999990006',
				city: 'Arraial do Cabo',
			});

			await expect(
				interestsRepository.create({
					userId,
					jobId,
					name: 'Maria Candidate',
					phone: '22999990006',
					city: 'Arraial do Cabo',
				}),
			).rejects.toThrow(ConflictException);
		});
	});

	describe('findByCompanyJobs + updateStatus + incrementJobInterestCount', () => {
		it('applies filters by company and status, updates status and increments job counter', async () => {
			const { companyId } = await createEmployer('0003');
			const { userId } = await createCandidate('0003');
			const { jobId } = await createJob(companyId, '0003');

			const created = await interestsRepository.create({
				userId,
				jobId,
				name: 'Carlos Candidate',
				phone: '22999990007',
				city: 'São Pedro da Aldeia',
			});

			const companyRows =
				await interestsRepository.findByCompanyJobs(companyId);
			expect(companyRows).toHaveLength(1);
			expect(companyRows[0]?.jobTitle).toBe('Vaga 0003');
			expect(companyRows[0]?.jobSlug).toContain('vaga-0003-');

			await interestsRepository.updateStatus(created.id, 'CONTACTED');

			const filtered = await interestsRepository.findByCompanyJobs(companyId, {
				status: 'CONTACTED',
				jobId,
			});
			expect(filtered).toHaveLength(1);
			expect(filtered[0]?.status).toBe('CONTACTED');

			await interestsRepository.incrementJobInterestCount(jobId);
			const [jobAfter] = await db
				.select({ interestCount: jobs.interestCount })
				.from(jobs)
				.where(eq(jobs.id, jobId))
				.limit(1);
			expect(jobAfter?.interestCount).toBeGreaterThanOrEqual(1);
		});

		it('returns empty list when company has no jobs or unrelated filter jobId', async () => {
			const { companyId } = await createEmployer('0004');

			const noJobs = await interestsRepository.findByCompanyJobs(companyId);
			expect(noJobs).toEqual([]);

			const unrelated = await interestsRepository.findByCompanyJobs(companyId, {
				jobId: uuidv7(),
			});
			expect(unrelated).toEqual([]);
		});
	});
});
