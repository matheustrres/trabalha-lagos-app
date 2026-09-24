import {
	ConflictException,
	ForbiddenException,
	NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type MockProxy } from 'vitest-mock-extended';

import { CompaniesService } from '@/modules/companies/companies.service';
import { InterestsRepository } from '@/modules/interests/interests.repository';
import { InterestsService } from '@/modules/interests/interests.service';
import { JobsService } from '@/modules/jobs/jobs.service';

import { aCompany } from '#/data/builders/company.builder';
import { anInterest } from '#/data/builders/interest.builder';
import { aJob } from '#/data/builders/job.builder';
import { makeInterestsRepositoryMock } from '#/data/builders/repositories/interests.repository';
import { makeCompaniesServiceMock } from '#/data/mocks/companies.service.mock';
import { makeJobsServiceMock } from '#/data/mocks/jobs.service.mock';

describe(InterestsService.name, () => {
	let SUT: InterestsService;
	let interestsRepository: MockProxy<InterestsRepository>;
	let jobsService: MockProxy<JobsService>;
	let companiesService: MockProxy<CompaniesService>;

	beforeEach(() => {
		interestsRepository = makeInterestsRepositoryMock();
		jobsService = makeJobsServiceMock();
		companiesService = makeCompaniesServiceMock();
		SUT = new InterestsService(
			interestsRepository,
			jobsService,
			companiesService,
		);
	});

	// ─── create ────────────────────────────────────────────────────────────────

	describe('create', () => {
		it('creates interest successfully when job is active and user has not already applied', async () => {
			const job = aJob().withStatus('ACTIVE').build();
			const dto = {
				name: 'João Silva',
				phone: '22999999999',
				city: 'Cabo Frio',
			};
			const interest = anInterest().build();

			jobsService.findByIdOrFail.mockResolvedValue(job as any);
			interestsRepository.findByUserIdAndJobId.mockResolvedValue(null);
			interestsRepository.create.mockResolvedValue(interest);
			interestsRepository.incrementJobInterestCount.mockResolvedValue(
				undefined,
			);

			const result = await SUT.create(job.id, dto, 'user-uuid-1');

			expect(result).toEqual(interest);
			expect(jobsService.findByIdOrFail).toHaveBeenCalledWith(job.id);
			expect(interestsRepository.findByUserIdAndJobId).toHaveBeenCalledWith(
				'user-uuid-1',
				job.id,
			);
			expect(interestsRepository.create).toHaveBeenCalledWith({
				userId: 'user-uuid-1',
				jobId: job.id,
				name: dto.name,
				phone: dto.phone,
				city: dto.city,
			});
		});

		it('throws NotFoundException when job is not active', async () => {
			const job = aJob().withStatus('CLOSED').build();
			const dto = {
				name: 'João Silva',
				phone: '22999999999',
				city: 'Cabo Frio',
			};

			jobsService.findByIdOrFail.mockResolvedValue(job as any);

			await expect(SUT.create(job.id, dto, 'user-uuid-1')).rejects.toThrow(
				NotFoundException,
			);
		});

		it('throws ConflictException when user has already applied to the same job', async () => {
			const job = aJob().withStatus('ACTIVE').build();
			const dto = {
				name: 'João Silva',
				phone: '22999999999',
				city: 'Cabo Frio',
			};
			const existingInterest = anInterest().build();

			jobsService.findByIdOrFail.mockResolvedValue(job as any);
			interestsRepository.findByUserIdAndJobId.mockResolvedValue(
				existingInterest as any,
			);

			await expect(SUT.create(job.id, dto, 'user-uuid-1')).rejects.toThrow(
				ConflictException,
			);
		});

		it('creates anonymous interest when user is not authenticated', async () => {
			const job = aJob().withStatus('ACTIVE').build();
			const dto = {
				name: 'Visitante',
				phone: '22999990009',
				city: 'Búzios',
			};
			const interest = anInterest().withUserId(null).build();

			jobsService.findByIdOrFail.mockResolvedValue(job as any);
			interestsRepository.create.mockResolvedValue(interest);
			interestsRepository.incrementJobInterestCount.mockResolvedValue(
				undefined,
			);

			const result = await SUT.create(job.id, dto);

			expect(interestsRepository.findByUserIdAndJobId).not.toHaveBeenCalled();
			expect(interestsRepository.create).toHaveBeenCalledWith({
				userId: undefined,
				jobId: job.id,
				name: dto.name,
				phone: dto.phone,
				city: dto.city,
			});
			expect(result.userId).toBeNull();
		});

		it('does not fail create response when interest count increment fails', async () => {
			const job = aJob().withStatus('ACTIVE').build();
			const dto = {
				name: 'João Silva',
				phone: '22999999999',
				city: 'Cabo Frio',
			};
			const interest = anInterest().build();

			jobsService.findByIdOrFail.mockResolvedValue(job as any);
			interestsRepository.findByUserIdAndJobId.mockResolvedValue(null);
			interestsRepository.create.mockResolvedValue(interest);
			interestsRepository.incrementJobInterestCount.mockRejectedValue(
				new Error('counter failed'),
			);

			const result = await SUT.create(job.id, dto, 'user-uuid-1');

			await vi.waitFor(() => {
				expect(
					interestsRepository.incrementJobInterestCount,
				).toHaveBeenCalledWith(job.id);
			});
			expect(result).toEqual(interest);
		});
	});

	// ─── findByCompany ─────────────────────────────────────────────────────────

	describe('findByCompany', () => {
		it('returns interests with phone hidden for FREE plan', async () => {
			const company = aCompany().withPlan('FREE').build();
			const interest = anInterest().buildWithJobTitle();

			companiesService.findByUserId.mockResolvedValue(company);
			interestsRepository.findByCompanyJobs.mockResolvedValue([
				interest as any,
			]);

			const result = await SUT.findByCompany('user-uuid-1');

			expect(result.data).toHaveLength(1);
			expect(result.data[0]?.candidatePhone).toBeNull();
			expect(result.meta.phoneRestricted).toBe(true);
			expect(result.meta.plan).toBe('FREE');
		});

		it('returns interests with phone visible for PRO plan', async () => {
			const company = aCompany().withPlan('PRO').build();
			const interest = anInterest().buildWithJobTitle();

			companiesService.findByUserId.mockResolvedValue(company);
			interestsRepository.findByCompanyJobs.mockResolvedValue([
				interest as any,
			]);

			const result = await SUT.findByCompany('user-uuid-1');

			expect(result.data).toHaveLength(1);
			expect(result.data[0]?.candidatePhone).toBe('22999999999');
			expect(result.meta.phoneRestricted).toBe(false);
			expect(result.meta.plan).toBe('PRO');
		});

		it('applies filters when provided', async () => {
			const company = aCompany().withPlan('PRO').build();
			const interest = anInterest().withStatus('CONTACTED').buildWithJobTitle();

			companiesService.findByUserId.mockResolvedValue(company);
			interestsRepository.findByCompanyJobs.mockResolvedValue([
				interest as any,
			]);

			const result = await SUT.findByCompany('user-uuid-1', {
				status: 'CONTACTED',
			});

			expect(interestsRepository.findByCompanyJobs).toHaveBeenCalledWith(
				company.id,
				{
					status: 'CONTACTED',
				},
			);
			expect(result.data).toHaveLength(1);
			expect(result.data[0]?.status).toBe('CONTACTED');
		});

		it('returns empty list metadata when no interests are found', async () => {
			const company = aCompany().withPlan('FREE').build();

			companiesService.findByUserId.mockResolvedValue(company);
			interestsRepository.findByCompanyJobs.mockResolvedValue([]);

			const result = await SUT.findByCompany('user-uuid-1');

			expect(result).toEqual({
				data: [],
				meta: {
					total: 0,
					plan: 'FREE',
					phoneRestricted: true,
				},
			});
		});
	});

	describe('getDashboard', () => {
		it('counts expired jobs without including closed jobs', async () => {
			companiesService.findByUserId.mockResolvedValue(
				aCompany().withPlan('FREE').build(),
			);
			jobsService.findByCompanyForDashboard.mockResolvedValue([
				{ ...aJob().build(), status: 'EXPIRED' },
				{
					...aJob().build(),
					status: 'ACTIVE',
					expiresAt: new Date('2020-01-01'),
				},
				{
					...aJob().build(),
					status: 'CLOSED',
					expiresAt: new Date('2020-01-01'),
				},
			] as any);
			interestsRepository.findByCompanyJobs.mockResolvedValue([]);

			const result = await SUT.getDashboard('user-uuid-1');
			expect(result.metrics.expiredJobs).toBe(2);
		});

		it.each(['FREE', 'PRO', 'SEASON'] as const)(
			'scopes view metrics for %s',
			async (plan) => {
				companiesService.findByUserId.mockResolvedValue(
					aCompany().withPlan(plan).build(),
				);
				jobsService.findByCompanyForDashboard.mockResolvedValue([
					{
						...aJob().build(),
						viewCount: 12,
						interestCount: 3,
						expiresAt: new Date('2099-01-01'),
					},
				] as any);
				interestsRepository.findByCompanyJobs.mockResolvedValue([
					anInterest().withStatus('SENT').buildWithJobTitle() as any,
				]);
				const result = await SUT.getDashboard('user-uuid-1');
				expect(result.metrics.interestsCount).toBe(1);
				expect(result.metrics.newInterestsCount).toBe(1);
				expect('totalViews' in result.metrics).toBe(plan !== 'FREE');
				expect('viewCount' in result.recentJobs[0]!).toBe(plan === 'SEASON');
				expect('comparison' in result).toBe(plan === 'SEASON');
			},
		);
	});

	// ─── updateStatus ────────────────────────────────────────────────────────────

	describe('updateStatus', () => {
		it('updates status when user owns the company and interest belongs to its job', async () => {
			const company = aCompany().build();
			const interest = anInterest().build();
			const dto = { status: 'CONTACTED' as const };
			const updatedInterest = { ...interest, status: 'CONTACTED' as const };

			companiesService.findByUserId.mockResolvedValue(company);
			interestsRepository.findById.mockResolvedValue(interest as any);
			interestsRepository.findByCompanyJobs.mockResolvedValue([
				interest as any,
			]);
			interestsRepository.updateStatus.mockResolvedValue(updatedInterest);

			const result = await SUT.updateStatus(interest.id, 'user-uuid-1', dto);

			expect(result).toEqual(updatedInterest);
			expect(interestsRepository.updateStatus).toHaveBeenCalledWith(
				interest.id,
				'CONTACTED',
			);
		});

		it('throws ForbiddenException when interest does not belong to company jobs', async () => {
			const company = aCompany().build();
			const interest = anInterest().withJobId('other-job-uuid').build();
			const dto = { status: 'CONTACTED' as const };

			companiesService.findByUserId.mockResolvedValue(company);
			interestsRepository.findById.mockResolvedValue(interest as any);
			interestsRepository.findByCompanyJobs.mockResolvedValue([]);

			await expect(
				SUT.updateStatus(interest.id, 'user-uuid-1', dto),
			).rejects.toThrow(ForbiddenException);
		});

		it('throws NotFoundException when interest does not exist', async () => {
			const company = aCompany().build();

			companiesService.findByUserId.mockResolvedValue(company);
			interestsRepository.findById.mockResolvedValue(null);

			await expect(
				SUT.updateStatus('non-existent-id', 'user-uuid-1', {
					status: 'VIEWED' as const,
				}),
			).rejects.toThrow(NotFoundException);
		});

		it('returns null when repository updateStatus returns null', async () => {
			const company = aCompany().build();
			const interest = anInterest().build();

			companiesService.findByUserId.mockResolvedValue(company);
			interestsRepository.findById.mockResolvedValue(interest as any);
			interestsRepository.findByCompanyJobs.mockResolvedValue([
				interest as any,
			]);
			interestsRepository.updateStatus.mockResolvedValue(null);

			const result = await SUT.updateStatus(interest.id, 'user-uuid-1', {
				status: 'VIEWED',
			});

			expect(result).toBeNull();
		});

		it('propagates unexpected repository errors', async () => {
			const company = aCompany().build();
			const dbError = new Error('database unavailable');

			companiesService.findByUserId.mockResolvedValue(company);
			interestsRepository.findById.mockRejectedValue(dbError);

			await expect(
				SUT.updateStatus('interest-uuid-1', 'user-uuid-1', {
					status: 'REJECTED',
				}),
			).rejects.toThrow(dbError);
		});
	});
});
