import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { CreateJobDto } from './dto/create-job.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsRepository } from './jobs.repository';
import { ViewCounterService } from './services/view-counter.service';

import { generateJobSlug } from '@/common/utils/slugify';

import { CompaniesService } from '@/modules/companies/companies.service';

type JobStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';

const PLAN_ACTIVE_JOB_LIMITS: Record<string, number> = {
	FREE: 2,
	PRO: 10,
	SEASON: Infinity,
};

const PLAN_EXPIRY_DAYS: Record<string, number> = {
	FREE: 30,
	PRO: 60,
	SEASON: 60,
};

const REGION_BOUNDS = {
	latMin: -23.1,
	latMax: -22.6,
	lngMin: -42.6,
	lngMax: -41.8,
};

@Injectable()
export class JobsService {
	constructor(
		private readonly jobsRepository: JobsRepository,
		private readonly companiesService: CompaniesService,
		private readonly viewCounterService: ViewCounterService,
	) {}

	async search(params: QueryJobsDto) {
		return this.jobsRepository.findByRadius(params);
	}

	async findByIdOrFail(id: string) {
		const job = await this.jobsRepository.findById(id);
		if (!job) throw new NotFoundException('Vaga não encontrada.');
		return job;
	}

	async findBySlug(slug: string, ip: string, userAgent: string) {
		const job = await this.jobsRepository.findBySlug(slug);
		if (!job) throw new NotFoundException('Vaga não encontrada.');

		// Fire-and-forget: increment view count without blocking response
		this.viewCounterService.increment(job.id, ip, userAgent).catch(() => {});

		return job;
	}

	async create(userId: string, dto: CreateJobDto) {
		const company = await this.companiesService.findByUserId(userId);

		const activeCount = await this.jobsRepository.countActiveByCompanyId(
			company.id,
		);
		const limit = PLAN_ACTIVE_JOB_LIMITS[company.plan] ?? 2;

		if (activeCount >= limit) {
			throw new ForbiddenException(
				`Limite de vagas ativas atingido para o plano ${company.plan}. ` +
					`Máximo: ${limit === Infinity ? 'ilimitado' : limit}.`,
			);
		}

		this.validateCoordinates(dto.locationLat, dto.locationLng);

		const expiryDays = PLAN_EXPIRY_DAYS[company.plan] ?? 30;
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + expiryDays);

		const canFeatureUrgent = company.plan === 'SEASON';
		const featured = canFeatureUrgent ? (dto.featured ?? false) : false;
		const urgent = canFeatureUrgent ? (dto.urgent ?? false) : false;

		const slug = generateJobSlug(dto.title, dto.city);

		return this.jobsRepository.create({
			companyId: company.id,
			slug,
			title: dto.title,
			description: dto.description,
			categoryId: dto.categoryId,
			contractType: dto.contractType,
			city: dto.city,
			address: dto.address,
			location: { x: dto.locationLng, y: dto.locationLat },
			salaryMin: dto.salaryMin,
			salaryMax: dto.salaryMax,
			salaryHidden: dto.salaryHidden,
			whatsappContact: dto.whatsappContact,
			contactMethod: dto.contactMethod,
			featured,
			urgent,
			expiresAt,
		});
	}

	async update(id: string, userId: string, dto: UpdateJobDto) {
		const company = await this.companiesService.findByUserId(userId);
		const job = await this.jobsRepository.findById(id);

		if (!job) throw new NotFoundException('Vaga não encontrada.');
		if (job.companyId !== company.id)
			throw new ForbiddenException('Acesso negado.');

		if (dto.locationLat !== undefined || dto.locationLng !== undefined) {
			const lat = dto.locationLat ?? job.location.y;
			const lng = dto.locationLng ?? job.location.x;
			this.validateCoordinates(lat, lng);
		}

		const canFeatureUrgent = company.plan === 'SEASON';

		const { locationLat, locationLng, requirements: _req, ...rest } = dto;

		return this.jobsRepository.update(id, {
			...rest,
			...(dto.featured !== undefined && {
				featured: canFeatureUrgent ? dto.featured : false,
			}),
			...(dto.urgent !== undefined && {
				urgent: canFeatureUrgent ? dto.urgent : false,
			}),
			...(locationLat !== undefined &&
				locationLng !== undefined && {
					location: { x: locationLng, y: locationLat },
				}),
		});
	}

	async updateStatus(id: string, userId: string, status: JobStatus) {
		const company = await this.companiesService.findByUserId(userId);
		const job = await this.jobsRepository.findById(id);

		if (!job) throw new NotFoundException('Vaga não encontrada.');
		if (job.companyId !== company.id)
			throw new ForbiddenException('Acesso negado.');

		return this.jobsRepository.updateStatus(id, status);
	}

	async findByCompany(userId: string) {
		const company = await this.companiesService.findByUserId(userId);
		return this.jobsRepository.findByCompanyId(company.id);
	}

	private validateCoordinates(lat: number, lng: number): void {
		const { latMin, latMax, lngMin, lngMax } = REGION_BOUNDS;
		if (lat < latMin || lat > latMax || lng < lngMin || lng > lngMax) {
			throw new BadRequestException(
				'Coordenadas fora da Região dos Lagos. ' +
					`Latitude deve estar entre ${latMin} e ${latMax}, ` +
					`longitude entre ${lngMin} e ${lngMax}.`,
			);
		}
	}
}
