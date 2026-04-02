import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { CompanyResponseDto } from '@/modules/companies/dto/company-response.dto';
import { CreateCompanyDto } from '@/modules/companies/dto/create-company.dto';
import { UpdateCompanyDto } from '@/modules/companies/dto/update-company.dto';

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

describe('Companies DTOs', () => {
	describe(CreateCompanyDto.name, () => {
		it('accepts valid payload', () => {
			const errors = getValidationErrors(CreateCompanyDto, {
				name: 'Restaurante Beira Mar',
				city: 'Cabo Frio',
				whatsapp: '22999990001',
				document: '11222333000181',
			});

			expect(errors).toHaveLength(0);
		});

		it('rejects invalid whatsapp phone', () => {
			const errors = getValidationErrors(CreateCompanyDto, {
				name: 'Restaurante Beira Mar',
				city: 'Cabo Frio',
				whatsapp: '11111111111',
				document: '11222333000181',
			});

			expect(hasPropertyError(errors, 'whatsapp')).toBe(true);
		});

		it('rejects invalid CNPJ', () => {
			const errors = getValidationErrors(CreateCompanyDto, {
				name: 'Restaurante Beira Mar',
				city: 'Cabo Frio',
				whatsapp: '22999990001',
				document: '11111111111111',
			});

			expect(hasPropertyError(errors, 'document')).toBe(true);
		});
	});

	describe(UpdateCompanyDto.name, () => {
		it('accepts partial payload with valid logoUrl', () => {
			const errors = getValidationErrors(UpdateCompanyDto, {
				name: 'Empresa Atualizada',
				logoUrl: 'https://example.com/logo.png',
			});

			expect(errors).toHaveLength(0);
		});

		it('rejects invalid logoUrl format', () => {
			const errors = getValidationErrors(UpdateCompanyDto, {
				logoUrl: 'ftp://example.com/logo.png',
			});

			expect(hasPropertyError(errors, 'logoUrl')).toBe(true);
		});

		it('rejects whatsapp longer than max length', () => {
			const errors = getValidationErrors(UpdateCompanyDto, {
				whatsapp: '2299999999999999',
			});

			expect(hasPropertyError(errors, 'whatsapp')).toBe(true);
		});
	});

	describe(CompanyResponseDto.name, () => {
		it('maps payload with nullable fields', () => {
			const payload = {
				id: 'company-uuid-1',
				userId: 'user-uuid-1',
				name: 'Empresa Teste',
				document: null,
				city: 'Cabo Frio',
				segment: null,
				logoUrl: null,
				whatsapp: null,
				plan: 'FREE',
				planExpiresAt: null,
				verified: false,
				createdAt: new Date('2026-01-01T00:00:00.000Z'),
				updatedAt: new Date('2026-01-01T00:00:00.000Z'),
			};

			const dto = plainToInstance(CompanyResponseDto, payload);

			expect(dto).toBeInstanceOf(CompanyResponseDto);
			expect(dto).toEqual(payload);
		});
	});
});
