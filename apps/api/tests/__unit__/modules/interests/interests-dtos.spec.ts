import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { CreateInterestDto } from '@/modules/interests/dto/create-interest.dto';
import {
	InterestResponseDto,
	InterestsListResponseDto,
} from '@/modules/interests/dto/interest-response.dto';
import { QueryInterestsDto } from '@/modules/interests/dto/query-interests.dto';
import { UpdateInterestStatusDto } from '@/modules/interests/dto/update-interest-status.dto';

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
): boolean => {
	return errors.some((error) => error.property === property);
};

describe('Interests DTOs', () => {
	describe(CreateInterestDto.name, () => {
		it('accepts valid payload', () => {
			const errors = getValidationErrors(CreateInterestDto, {
				name: 'João Candidate',
				phone: '22999990005',
				city: 'Cabo Frio',
			});

			expect(errors).toHaveLength(0);
		});

		it('rejects short name and city', () => {
			const errors = getValidationErrors(CreateInterestDto, {
				name: 'J',
				phone: '22999990005',
				city: 'C',
			});

			expect(hasPropertyError(errors, 'name')).toBe(true);
			expect(hasPropertyError(errors, 'city')).toBe(true);
		});

		it('rejects phone outside allowed size range', () => {
			const errors = getValidationErrors(CreateInterestDto, {
				name: 'João Candidate',
				phone: '22999',
				city: 'Cabo Frio',
			});

			expect(hasPropertyError(errors, 'phone')).toBe(true);
		});
	});

	describe(QueryInterestsDto.name, () => {
		it('accepts valid filters', () => {
			const errors = getValidationErrors(QueryInterestsDto, {
				status: 'SENT',
				jobId: '019682b6-7b4a-7000-8000-000000000002',
				availability: 'IMMEDIATE',
				area: 'turismo-hospitalidade',
			});

			expect(errors).toHaveLength(0);
		});

		it('rejects invalid status enum', () => {
			const errors = getValidationErrors(QueryInterestsDto, {
				status: 'PENDING' as QueryInterestsDto['status'],
			});

			expect(hasPropertyError(errors, 'status')).toBe(true);
		});

		it('rejects invalid availability enum', () => {
			const errors = getValidationErrors(QueryInterestsDto, {
				availability: 'TOMORROW' as QueryInterestsDto['availability'],
			});

			expect(hasPropertyError(errors, 'availability')).toBe(true);
		});

		it('rejects invalid jobId UUID', () => {
			const errors = getValidationErrors(QueryInterestsDto, {
				jobId: 'not-a-uuid',
			});

			expect(hasPropertyError(errors, 'jobId')).toBe(true);
		});
	});

	describe(UpdateInterestStatusDto.name, () => {
		it('accepts valid status', () => {
			const errors = getValidationErrors(UpdateInterestStatusDto, {
				status: 'CONTACTED',
			});

			expect(errors).toHaveLength(0);
		});

		it('rejects non-allowed status', () => {
			const errors = getValidationErrors(UpdateInterestStatusDto, {
				status: 'SENT' as UpdateInterestStatusDto['status'],
			});

			expect(hasPropertyError(errors, 'status')).toBe(true);
		});
	});

	describe('Response DTOs', () => {
		it('maps interest response payload including nullable phone', () => {
			const payload = {
				id: 'interest-uuid-1',
				candidateName: 'João Candidate',
				candidateCity: 'Cabo Frio',
				candidatePhone: null,
				jobId: 'job-uuid-1',
				jobTitle: 'Atendente',
				jobSlug: 'atendente-cabo-frio-uuid',
				status: 'SENT',
				createdAt: new Date('2026-01-01T00:00:00.000Z'),
			};

			const dto = plainToInstance(InterestResponseDto, payload);

			expect(dto).toBeInstanceOf(InterestResponseDto);
			expect(dto).toEqual(payload);
		});

		it('maps list response payload', () => {
			const payload = {
				data: [],
				meta: {
					total: 0,
					plan: 'FREE',
					phoneRestricted: true,
				},
			};

			const dto = plainToInstance(InterestsListResponseDto, payload);

			expect(dto).toBeInstanceOf(InterestsListResponseDto);
			expect(dto).toEqual(payload);
		});
	});
});
