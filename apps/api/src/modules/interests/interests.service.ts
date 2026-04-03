import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { CreateInterestDto } from './dto/create-interest.dto';
import { QueryInterestsDto } from './dto/query-interests.dto';
import { UpdateInterestStatusDto } from './dto/update-interest-status.dto';
import { InterestsRepository } from './interests.repository';

import { CompaniesService } from '@/modules/companies/companies.service';
import { JobsService } from '@/modules/jobs/jobs.service';

import { InterestSchema } from '@/shared/modules/database/schema';

const isFilledText = (value?: string | null): boolean =>
	Boolean(value && value.trim().length > 0);

const hasAtLeastOneItem = (value?: string[] | null): boolean =>
	Array.isArray(value) && value.length > 0;

@Injectable()
export class InterestsService {
	constructor(
		private readonly interestsRepository: InterestsRepository,
		private readonly jobsService: JobsService,
		private readonly companiesService: CompaniesService,
	) {}

	async create(
		jobId: string,
		dto: CreateInterestDto,
		userId?: string,
	): Promise<InterestSchema> {
		const job = await this.jobsService.findByIdOrFail(jobId);

		if (job?.status !== 'ACTIVE') {
			throw new NotFoundException('Vaga não encontrada ou não está ativa.');
		}

		if (userId) {
			const existing = await this.interestsRepository.findByUserIdAndJobId(
				userId,
				jobId,
			);
			if (existing) {
				throw new ConflictException('Você já demonstrou interesse nesta vaga.');
			}
		}

		const interest = await this.interestsRepository.create({
			userId,
			jobId,
			name: dto.name,
			phone: dto.phone,
			city: dto.city,
		});

		// Fire-and-forget: increment interest count without blocking response
		this.interestsRepository.incrementJobInterestCount(jobId).catch(() => {});

		return interest;
	}

	async findByCompany(userId: string, filters?: QueryInterestsDto) {
		const company = await this.companiesService.findByUserId(userId);

		const rows = await this.interestsRepository.findByCompanyJobs(
			company.id,
			filters,
		);

		const phoneRestricted = company.plan === 'FREE';

		const data = rows.map((row) => ({
			profileBadge:
				hasAtLeastOneItem(row.candidateInterests) &&
				hasAtLeastOneItem(row.candidateAcceptedContractTypes) &&
				isFilledText(row.candidateExperience) &&
				isFilledText(row.candidateAvailability) &&
				isFilledText(row.candidateNeighborhood)
					? 'COMPLETE'
					: 'BASIC',
			id: row.id,
			candidateName: row.name,
			candidateCity: row.city,
			candidatePhone: phoneRestricted ? null : row.phone,
			candidateInterests: row.candidateInterests,
			candidateExperience: row.candidateExperience,
			candidateAvailability: row.candidateAvailability,
			candidateAcceptedContractTypes: row.candidateAcceptedContractTypes,
			candidateNeighborhood: row.candidateNeighborhood,
			jobId: row.jobId,
			jobTitle: row.jobTitle,
			jobSlug: row.jobSlug,
			status: row.status,
			createdAt: row.createdAt,
		}));

		return {
			data,
			meta: {
				total: data.length,
				plan: company.plan,
				phoneRestricted,
			},
		};
	}

	async updateStatus(
		interestId: string,
		userId: string,
		dto: UpdateInterestStatusDto,
	): Promise<InterestSchema | null> {
		const company = await this.companiesService.findByUserId(userId);

		const interest = await this.interestsRepository.findById(interestId);
		if (!interest) throw new NotFoundException('Interesse não encontrado.');

		// Verify ownership: interest must belong to a job of this company
		const jobRows = await this.interestsRepository.findByCompanyJobs(
			company.id,
			{ jobId: interest.jobId },
		);
		if (jobRows.length === 0) {
			throw new ForbiddenException('Acesso negado.');
		}

		return this.interestsRepository.updateStatus(interestId, dto.status);
	}
}
