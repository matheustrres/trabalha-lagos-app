import {
	BadRequestException,
	ForbiddenException,
	NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mock, type MockProxy } from 'vitest-mock-extended';

import { CompaniesService } from '@/modules/companies/companies.service';
import { ExternalJobsRepository } from '@/modules/jobs/external-jobs.repository';
import { JobsRepository } from '@/modules/jobs/jobs.repository';
import { JobsService } from '@/modules/jobs/jobs.service';
import { ViewCounterService } from '@/modules/jobs/services/view-counter.service';

import { aCompany } from '#/data/builders/company.builder';
import { aJob } from '#/data/builders/job.builder';
import { makeJobsRepositoryMock } from '#/data/mocks/jobs.repository.mock';

describe(JobsService.name, () => {
	let SUT: JobsService;
	let jobsRepository: MockProxy<JobsRepository>;
	let externalJobsRepository: MockProxy<ExternalJobsRepository>;
	let companiesService: MockProxy<CompaniesService>;
	let viewCounterService: MockProxy<ViewCounterService>;

	beforeEach(() => {
		jobsRepository = makeJobsRepositoryMock();
		externalJobsRepository = mock<ExternalJobsRepository>();
		externalJobsRepository.findForPublicSearch.mockResolvedValue([]);
		externalJobsRepository.countForPublicSearch.mockResolvedValue(0);
		companiesService = mock<CompaniesService>();
		viewCounterService = mock<ViewCounterService>();

		SUT = new JobsService(
			jobsRepository,
			externalJobsRepository,
			companiesService,
			viewCounterService,
		);
	});

	describe('search', () => {
		it('returns paginated data and metadata', async () => {
			const query = {
				page: 1,
				limit: 20,
				radius: 20,
				sort: 'recent',
			} as any;

			jobsRepository.findByRadius.mockResolvedValue([aJob().build() as any]);
			jobsRepository.countByRadius.mockResolvedValue(1);

			const result = await SUT.search(query);

			expect(result).toEqual({
				data: [{ sourceType: 'INTERNAL', ...aJob().build() }],
				meta: { total: 1, page: 1, limit: 20 },
			});
		});

		it('combines and paginates internal and synthetic external jobs', async () => {
			const query = {
				page: 1,
				limit: 2,
				radius: 20,
				sort: 'recent',
			} as any;
			const internalJob = {
				...aJob().build(),
				featured: false,
				createdAt: new Date('2026-09-20T10:00:00Z'),
			};
			const externalJob = {
				id: '01999999-0000-7000-8000-000000000001',
				source: 'SYNTHETIC',
				externalId: 'synthetic-1',
				title: '<b>Atendente</b>',
				descriptionSnippet: 'Vaga\u0000 fictícia',
				company: 'Empresa teste',
				redirectUrl: 'javascript:alert(1)',
				categoryOriginal: 'Comércio',
				contractTypeOriginal: 'CLT',
				salaryMin: 165000,
				salaryMax: 210000,
				salaryPredicted: false,
				locationText: 'Cabo Frio, RJ',
				locationArea: ['Cabo Frio'],
				city: 'cabo-frio',
				publishedAt: new Date('2026-09-21T10:00:00Z'),
				status: 'ACTIVE' as const,
				firstSeenAt: new Date(),
				lastSeenAt: new Date(),
				expiresAt: new Date('2026-10-21T10:00:00Z'),
				createdAt: new Date(),
				updatedAt: new Date(),
				distanceKm: 1,
			};

			jobsRepository.findByRadius.mockResolvedValue([internalJob] as any);
			jobsRepository.countByRadius.mockResolvedValue(1);
			externalJobsRepository.findForPublicSearch.mockResolvedValue([
				externalJob,
			]);
			externalJobsRepository.countForPublicSearch.mockResolvedValue(1);

			const result = await SUT.search(query);

			expect(jobsRepository.findByRadius).toHaveBeenCalledWith(query, {
				limit: 2,
				offset: 0,
			});
			expect(result.meta.total).toBe(2);
			expect(result.data.map((job) => job.sourceType)).toEqual([
				'EXTERNAL',
				'INTERNAL',
			]);
			expect(result.data[0]).toEqual(
				expect.objectContaining({
					title: 'Atendente',
					description: 'Vaga fictícia',
					redirectUrl: null,
				}),
			);
		});
	});

	describe('findByIdOrFail', () => {
		it('returns job when found', async () => {
			const job = {
				...aJob().build(),
				location: { x: -42.0187, y: -22.8789 },
			};
			jobsRepository.findById.mockResolvedValue(job as any);

			const result = await SUT.findByIdOrFail(job.id);

			expect(result).toEqual(job);
		});

		it('throws NotFoundException when job does not exist', async () => {
			jobsRepository.findById.mockResolvedValue(null);

			await expect(SUT.findByIdOrFail('missing-id')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('findBySlug', () => {
		it('returns job and increments view counter asynchronously', async () => {
			const job = { ...aJob().build(), location: undefined };
			jobsRepository.findBySlug.mockResolvedValue(job as any);
			viewCounterService.increment.mockResolvedValue(undefined as never);

			const result = await SUT.findBySlug(
				'atendente-de-turismo',
				'1.2.3.4',
				'UA',
			);

			expect(result).toEqual(job);
			await vi.waitFor(() => {
				expect(viewCounterService.increment).toHaveBeenCalledWith(
					job.id,
					'1.2.3.4',
					'UA',
				);
			});
		});

		it('throws NotFoundException when slug does not exist', async () => {
			jobsRepository.findBySlug.mockResolvedValue(null);

			await expect(SUT.findBySlug('missing', '', '')).rejects.toThrow(
				NotFoundException,
			);
		});

		it('does not fail response when view counter increment fails', async () => {
			const job = { ...aJob().build(), location: undefined };
			jobsRepository.findBySlug.mockResolvedValue(job as any);
			viewCounterService.increment.mockRejectedValue(new Error('redis down'));

			const result = await SUT.findBySlug(job.slug, '1.2.3.4', 'UA');

			expect(result).toEqual(job);
		});
	});

	describe('create', () => {
		const createDto = {
			title: 'Atendente de Turismo',
			description:
				'Descrição detalhada da vaga com requisitos e benefícios para testes.',
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
			requirements: ['Experiência'],
			featured: true,
			urgent: true,
		} as any;

		it('throws ForbiddenException when active jobs limit is reached for FREE plan', async () => {
			const company = aCompany().withPlan('FREE').build();
			companiesService.findByUserId.mockResolvedValue(company as never);
			jobsRepository.countActiveByCompanyId.mockResolvedValue(2);

			await expect(SUT.create('user-uuid-1', createDto)).rejects.toThrow(
				ForbiddenException,
			);
		});

		it('forces featured/urgent to false for non-SEASON plans', async () => {
			const company = aCompany().withPlan('PRO').build();
			const created = {
				...aJob().build(),
				location: { x: -42.0187, y: -22.8789 },
			};

			companiesService.findByUserId.mockResolvedValue(company as never);
			jobsRepository.countActiveByCompanyId.mockResolvedValue(0);
			jobsRepository.create.mockResolvedValue(created as never);

			await SUT.create('user-uuid-1', createDto);

			expect(jobsRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					featured: false,
					urgent: false,
				}),
			);
		});

		it('keeps featured/urgent flags for SEASON plan', async () => {
			const company = aCompany().withPlan('SEASON').build();
			const created = {
				...aJob().build(),
				location: { x: -42.0187, y: -22.8789 },
			};

			companiesService.findByUserId.mockResolvedValue(company as never);
			jobsRepository.countActiveByCompanyId.mockResolvedValue(0);
			jobsRepository.create.mockResolvedValue(created as never);

			await SUT.create('user-uuid-1', createDto);

			expect(jobsRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					featured: true,
					urgent: true,
				}),
			);
		});

		it('throws BadRequestException when coordinates are outside region bounds', async () => {
			const company = aCompany().withPlan('PRO').build();
			companiesService.findByUserId.mockResolvedValue(company as never);
			jobsRepository.countActiveByCompanyId.mockResolvedValue(0);

			await expect(
				SUT.create('user-uuid-1', {
					...createDto,
					locationLat: -25,
					locationLng: -45,
				}),
			).rejects.toThrow(BadRequestException);
		});
	});

	describe('update', () => {
		it('throws NotFoundException when job does not exist', async () => {
			companiesService.findByUserId.mockResolvedValue(
				aCompany().build() as never,
			);
			jobsRepository.findById.mockResolvedValue(null);

			await expect(
				SUT.update('job-missing', 'user-uuid-1', {
					title: 'Novo título',
				} as any),
			).rejects.toThrow(NotFoundException);
		});

		it('throws ForbiddenException when job does not belong to company', async () => {
			companiesService.findByUserId.mockResolvedValue(
				aCompany().withId('company-owner').build() as never,
			);
			jobsRepository.findById.mockResolvedValue({
				...aJob().withCompanyId('other-company').build(),
				location: { x: -42.0187, y: -22.8789 },
			} as any);

			await expect(
				SUT.update('job-1', 'user-uuid-1', { title: 'Novo título' } as any),
			).rejects.toThrow(ForbiddenException);
		});

		it('throws BadRequestException on partial coordinate update outside bounds', async () => {
			companiesService.findByUserId.mockResolvedValue(
				aCompany().withId('company-uuid-1').build() as never,
			);
			jobsRepository.findById.mockResolvedValue({
				...aJob().withCompanyId('company-uuid-1').build(),
				location: { x: -42.0187, y: -22.8789 },
			} as any);

			await expect(
				SUT.update('job-1', 'user-uuid-1', { locationLat: -30 } as any),
			).rejects.toThrow(BadRequestException);
		});

		it('returns updated job on success', async () => {
			const updated = {
				...aJob().withCompanyId('company-uuid-1').build(),
				title: 'Título Atualizado',
				location: { x: -42.0187, y: -22.8789 },
			};

			companiesService.findByUserId.mockResolvedValue(
				aCompany().withId('company-uuid-1').build() as never,
			);
			jobsRepository.findById.mockResolvedValue({
				...aJob().withCompanyId('company-uuid-1').build(),
				location: { x: -42.0187, y: -22.8789 },
			} as any);
			jobsRepository.update.mockResolvedValue(updated as any);

			const result = await SUT.update('job-1', 'user-uuid-1', {
				title: 'Título Atualizado',
			} as any);

			expect(result?.title).toBe('Título Atualizado');
		});
	});

	describe('updateStatus', () => {
		it('throws NotFoundException when job does not exist', async () => {
			companiesService.findByUserId.mockResolvedValue(
				aCompany().build() as never,
			);
			jobsRepository.findById.mockResolvedValue(null);

			await expect(
				SUT.updateStatus('missing', 'user-uuid-1', 'CLOSED' as any),
			).rejects.toThrow(NotFoundException);
		});

		it('throws ForbiddenException when user is not owner', async () => {
			companiesService.findByUserId.mockResolvedValue(
				aCompany().withId('company-owner').build() as never,
			);
			jobsRepository.findById.mockResolvedValue({
				...aJob().withCompanyId('other-company').build(),
				location: { x: -42.0187, y: -22.8789 },
			} as any);

			await expect(
				SUT.updateStatus('job-1', 'user-uuid-1', 'PAUSED' as any),
			).rejects.toThrow(ForbiddenException);
		});

		it('updates status on success', async () => {
			const updated = {
				...aJob().withCompanyId('company-uuid-1').build(),
				status: 'CLOSED',
				location: { x: -42.0187, y: -22.8789 },
			};

			companiesService.findByUserId.mockResolvedValue(
				aCompany().withId('company-uuid-1').build() as never,
			);
			jobsRepository.findById.mockResolvedValue({
				...aJob().withCompanyId('company-uuid-1').build(),
				location: { x: -42.0187, y: -22.8789 },
			} as any);
			jobsRepository.updateStatus.mockResolvedValue(updated as any);

			const result = await SUT.updateStatus(
				'job-1',
				'user-uuid-1',
				'CLOSED' as any,
			);

			expect(result?.status).toBe('CLOSED');
		});
	});

	describe('findByCompany', () => {
		it('returns jobs by authenticated company', async () => {
			const company = aCompany().withId('company-uuid-1').build();
			const jobs = [aJob().withCompanyId('company-uuid-1').build()];

			companiesService.findByUserId.mockResolvedValue(company as never);
			jobsRepository.findByCompanyId.mockResolvedValue(jobs as any);

			const result = await SUT.findByCompany('user-uuid-1');

			expect(jobsRepository.findByCompanyId).toHaveBeenCalledWith(
				'company-uuid-1',
			);
			expect(result).toEqual(jobs);
		});
	});
});
