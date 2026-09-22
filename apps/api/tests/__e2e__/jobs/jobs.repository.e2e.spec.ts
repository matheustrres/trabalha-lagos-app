import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createAppFixture } from '../__helpers/app-fixture';

import { JobsRepository } from '@/modules/jobs/jobs.repository';

import type { Database } from '@/shared/modules/database/database.provider';
import { companies, users } from '@/shared/modules/database/schema';

describe('JobsRepository (integration)', () => {
	let app: INestApplication;
	let db: Database;
	let jobsRepository: JobsRepository;
	let seq = 0;

	beforeAll(async () => {
		({ app, db } = await createAppFixture({ shouldClearAllDb: true }));
		jobsRepository = app.get(JobsRepository);
	});

	afterAll(async () => {
		await app.close();
	});

	const nextSuffix = (): string => {
		seq += 1;
		return String(seq).padStart(4, '0');
	};

	async function createEmployerCompany(
		plan: 'FREE' | 'PRO' | 'SEASON' = 'PRO',
	) {
		const suffix = nextSuffix();
		const [user] = await db
			.insert(users)
			.values({
				name: `Employer ${suffix}`,
				phone: `22994${suffix}00`,
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
				whatsapp: `22994${suffix}99`,
				plan,
			})
			.returning({ id: companies.id });

		return { companyId: company!.id };
	}

	describe('create + findById + findBySlug', () => {
		it('creates a job and retrieves it by id and slug', async () => {
			const { companyId } = await createEmployerCompany('PRO');
			const suffix = nextSuffix();
			const slug = `atendente-${suffix}`;

			const created = await jobsRepository.create({
				companyId,
				title: `Atendente ${suffix}`,
				slug,
				description:
					'Descrição detalhada da vaga com requisitos e benefícios para integração.',
				categoryId: 1,
				contractType: 'CLT',
				city: 'Cabo Frio',
				address: 'Rua das Flores, 123',
				location: { x: -42.0187, y: -22.8789 },
				salaryMin: 200000,
				salaryMax: 300000,
				salaryHidden: false,
				whatsappContact: '22999990001',
				contactMethod: 'WHATSAPP',
				featured: false,
				urgent: false,
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			});

			expect(created.id).toBeDefined();

			const byId = await jobsRepository.findById(created.id);
			expect(byId?.id).toBe(created.id);

			const bySlug = await jobsRepository.findBySlug(slug);
			expect(bySlug?.slug).toBe(slug);
			expect(bySlug?.category.slug).toBe('comercio-varejo');
			expect(bySlug?.company.id).toBe(companyId);
		});
	});

	describe('findByCompanyId + countActiveByCompanyId + update + updateStatus + incrementViewCount', () => {
		it('handles company-scoped listing and state transitions', async () => {
			const { companyId } = await createEmployerCompany('SEASON');
			const suffix = nextSuffix();

			const created = await jobsRepository.create({
				companyId,
				title: `Vaga ${suffix}`,
				slug: `vaga-${suffix}`,
				description:
					'Descrição detalhada da vaga com requisitos e benefícios para integração.',
				categoryId: 1,
				contractType: 'PJ',
				city: 'Búzios',
				address: 'Rua Central, 45',
				location: { x: -42.0187, y: -22.8789 },
				salaryMin: 250000,
				salaryMax: 400000,
				salaryHidden: false,
				whatsappContact: '22999990002',
				contactMethod: 'WHATSAPP',
				featured: true,
				urgent: true,
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			});

			const list = await jobsRepository.findByCompanyId(companyId);
			expect(list.length).toBeGreaterThan(0);
			expect(list.some((item) => item.id === created.id)).toBe(true);

			const activeBefore =
				await jobsRepository.countActiveByCompanyId(companyId);
			expect(activeBefore).toBeGreaterThan(0);

			const updated = await jobsRepository.update(created.id, {
				title: 'Título Atualizado',
				featured: false,
			});
			expect(updated?.title).toBe('Título Atualizado');

			const statusUpdated = await jobsRepository.updateStatus(
				created.id,
				'CLOSED',
			);
			expect(statusUpdated?.status).toBe('CLOSED');

			const activeAfter =
				await jobsRepository.countActiveByCompanyId(companyId);
			expect(activeAfter).toBeLessThan(activeBefore);

			await jobsRepository.incrementViewCount(created.id, 2);
			const afterViews = await jobsRepository.findById(created.id);
			expect(afterViews?.viewCount).toBe((created.viewCount ?? 0) + 2);
		});
	});

	describe('findByRadius + countByRadius', () => {
		it('returns and counts jobs using filters', async () => {
			const { companyId } = await createEmployerCompany('PRO');
			const suffix = nextSuffix();

			await jobsRepository.create({
				companyId,
				title: `Turismo ${suffix}`,
				slug: `turismo-${suffix}`,
				description:
					'Descrição detalhada da vaga com requisitos e benefícios para integração.',
				categoryId: 2,
				contractType: 'CLT',
				city: 'Cabo Frio',
				address: 'Rua do Turismo, 10',
				location: { x: -42.0187, y: -22.8789 },
				salaryMin: 180000,
				salaryMax: 250000,
				salaryHidden: false,
				whatsappContact: '22999990003',
				contactMethod: 'WHATSAPP',
				featured: true,
				urgent: false,
				expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
			});

			const params = {
				radius: 20,
				category: 'turismo-hospitalidade',
				city: 'Cabo Frio',
				featured: true,
				q: 'Turismo',
				page: 1,
				limit: 20,
				sort: 'recent',
			} as any;

			const data = await jobsRepository.findByRadius(params);
			const total = await jobsRepository.countByRadius(params);

			expect(data.length).toBeGreaterThan(0);
			expect(total).toBeGreaterThan(0);
			expect(data[0]?.category.slug).toBe('turismo-hospitalidade');
		});

		it('returns empty/zero when category slug does not exist', async () => {
			const params = {
				radius: 20,
				category: 'categoria-inexistente',
				page: 1,
				limit: 20,
				sort: 'recent',
			} as any;

			const data = await jobsRepository.findByRadius(params);
			const total = await jobsRepository.countByRadius(params);

			expect(data).toEqual([]);
			expect(total).toBe(0);
		});
	});
});
