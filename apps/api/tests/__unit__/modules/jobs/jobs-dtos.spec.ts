import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';
import { describe, expect, it } from 'vitest';

import {
	ContactMethod,
	ContractType,
	CreateJobDto,
} from '@/modules/jobs/dto/create-job.dto';
import { JobResponseDto } from '@/modules/jobs/dto/job-response.dto';
import { QueryJobsDto } from '@/modules/jobs/dto/query-jobs.dto';
import { SearchJobsResponseDto } from '@/modules/jobs/dto/search-jobs-response.dto';
import { UpdateJobStatusDto } from '@/modules/jobs/dto/update-job-status.dto';
import { UpdateJobDto } from '@/modules/jobs/dto/update-job.dto';

const getValidationErrors = <T extends object>(
	DtoClass: new () => T,
	payload: Partial<T>,
): ValidationError[] => {
	const dto = plainToInstance(DtoClass, payload);
	return validateSync(dto);
};

const hasPropertyError = (
	errors: ValidationError[],
	property: string,
): boolean => errors.some((error) => error.property === property);

describe('Jobs DTOs', () => {
	describe(CreateJobDto.name, () => {
		it('accepts valid payload', () => {
			const errors = getValidationErrors(CreateJobDto, {
				title: 'Atendente de Turismo',
				description:
					'Descrição detalhada da vaga com requisitos e benefícios para contratação.',
				categoryId: 1,
				contractType: ContractType.CLT,
				city: 'Cabo Frio',
				locationLng: -42.0187,
				locationLat: -22.8789,
				whatsappContact: '22999999999',
				contactMethod: ContactMethod.WHATSAPP,
			});

			expect(errors).toHaveLength(0);
		});

		it('rejects invalid contractType and short description', () => {
			const errors = getValidationErrors(CreateJobDto, {
				title: 'Atendente',
				description: 'curta',
				categoryId: 1,
				contractType: 'INVALID' as CreateJobDto['contractType'],
				city: 'Cabo Frio',
				locationLng: -42.0187,
				locationLat: -22.8789,
				whatsappContact: '22999999999',
			});

			expect(hasPropertyError(errors, 'description')).toBe(true);
			expect(hasPropertyError(errors, 'contractType')).toBe(true);
		});

		it('rejects invalid whatsapp and out-of-range coords', () => {
			const errors = getValidationErrors(CreateJobDto, {
				title: 'Atendente',
				description:
					'Descrição detalhada da vaga com requisitos e benefícios para contratação.',
				categoryId: 1,
				contractType: ContractType.CLT,
				city: 'Cabo Frio',
				locationLng: -190,
				locationLat: -100,
				whatsappContact: '11111111111',
			});

			expect(hasPropertyError(errors, 'locationLng')).toBe(true);
			expect(hasPropertyError(errors, 'locationLat')).toBe(true);
			expect(hasPropertyError(errors, 'whatsappContact')).toBe(true);
		});
	});

	describe(QueryJobsDto.name, () => {
		it('accepts valid filters and transforms featured', () => {
			const dto = plainToInstance(QueryJobsDto, {
				lat: '-22.8789',
				lng: '-42.0187',
				radius: '15',
				featured: 'true',
				page: '2',
				limit: '10',
				sort: 'recent',
			});

			const errors = validateSync(dto);

			expect(errors).toHaveLength(0);
			expect(dto.featured).toBe(true);
			expect(dto.page).toBe(2);
			expect(dto.limit).toBe(10);
		});

		it('rejects invalid bounds and enums', () => {
			const errors = getValidationErrors(QueryJobsDto, {
				lat: -95,
				lng: -200,
				radius: 0,
				contractType: 'INVALID' as QueryJobsDto['contractType'],
				sort: 'invalid' as QueryJobsDto['sort'],
			});

			expect(hasPropertyError(errors, 'lat')).toBe(true);
			expect(hasPropertyError(errors, 'lng')).toBe(true);
			expect(hasPropertyError(errors, 'radius')).toBe(true);
			expect(hasPropertyError(errors, 'contractType')).toBe(true);
			expect(hasPropertyError(errors, 'sort')).toBe(true);
		});
	});

	describe(UpdateJobStatusDto.name, () => {
		it('accepts valid status', () => {
			const errors = getValidationErrors(UpdateJobStatusDto, {
				status: 'PAUSED',
			});
			expect(errors).toHaveLength(0);
		});

		it('rejects invalid status', () => {
			const errors = getValidationErrors(UpdateJobStatusDto, {
				status: 'EXPIRED' as UpdateJobStatusDto['status'],
			});
			expect(hasPropertyError(errors, 'status')).toBe(true);
		});
	});

	describe(UpdateJobDto.name, () => {
		it('accepts empty payload because all fields are optional', () => {
			const errors = getValidationErrors(UpdateJobDto, {});
			expect(errors).toHaveLength(0);
		});
	});

	describe('Response DTOs', () => {
		it('maps job response and search response payloads', () => {
			const jobPayload = {
				id: 'job-uuid-1',
				title: 'Atendente de Turismo',
				slug: 'atendente-de-turismo-cabo-frio',
				description: 'Descrição detalhada da vaga...',
				contractType: 'CLT',
				city: 'Cabo Frio',
				address: 'Rua das Flores, 123',
				salaryMin: 200000,
				salaryMax: 300000,
				salaryHidden: false,
				whatsappContact: '22999999999',
				contactMethod: 'WHATSAPP',
				status: 'ACTIVE',
				featured: false,
				urgent: false,
				expiresAt: new Date('2026-02-01T00:00:00.000Z'),
				viewCount: 0,
				interestCount: 0,
				createdAt: new Date('2026-01-01T00:00:00.000Z'),
				distanceKm: null,
				company: {
					id: 'company-uuid-1',
					name: 'Empresa Teste',
					logoUrl: null,
					verified: false,
					plan: 'FREE',
				},
				category: {
					id: 1,
					name: 'Turismo e Hospitalidade',
					slug: 'turismo-hospitalidade',
					icon: '🏨',
				},
			};

			const searchPayload = {
				data: [jobPayload],
				meta: { total: 1, page: 1, limit: 20 },
			};

			const jobDto = plainToInstance(JobResponseDto, jobPayload);
			const searchDto = plainToInstance(SearchJobsResponseDto, searchPayload);

			expect(jobDto).toBeInstanceOf(JobResponseDto);
			expect(searchDto).toBeInstanceOf(SearchJobsResponseDto);
			expect(searchDto.meta.total).toBe(1);
			expect(searchDto.data).toHaveLength(1);
		});
	});
});
