import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidationError } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RefreshTokenDto } from '@/modules/auth/dto/refresh-token.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';

const CNPJ_VALID = '11222333000181';

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

describe('Auth DTOs', () => {
	describe(RegisterDto.name, () => {
		it('accepts valid candidate payload without document', () => {
			const errors = getValidationErrors(RegisterDto, {
				name: 'Maria Souza',
				phone: '22999990001',
				email: 'maria@trabalhalagos.com',
				password: 'Senha@123',
				city: 'Cabo Frio',
				role: 'CANDIDATE',
			});

			expect(errors).toHaveLength(0);
		});

		it('accepts valid employer payload with CNPJ', () => {
			const errors = getValidationErrors(RegisterDto, {
				name: 'Empresa Teste',
				phone: '22999990001',
				email: 'contato@empresateste.com',
				password: 'Senha@123',
				city: 'Cabo Frio',
				role: 'EMPLOYER',
				document: CNPJ_VALID,
			});

			expect(errors).toHaveLength(0);
		});

		it('requires document when role is EMPLOYER', () => {
			const errors = getValidationErrors(RegisterDto, {
				name: 'Empresa Teste',
				phone: '22999990001',
				email: 'contato@empresateste.com',
				password: 'Senha@123',
				city: 'Cabo Frio',
				role: 'EMPLOYER',
			});

			expect(hasPropertyError(errors, 'document')).toBe(true);
		});

		it('rejects CPF as employer document', () => {
			const errors = getValidationErrors(RegisterDto, {
				name: 'Empresa Teste',
				phone: '22999990001',
				email: 'contato@empresateste.com',
				password: 'Senha@123',
				city: 'Cabo Frio',
				role: 'EMPLOYER',
				document: '52998224725',
			});

			expect(hasPropertyError(errors, 'document')).toBe(true);
		});

		it('rejects invalid role', () => {
			const errors = getValidationErrors(RegisterDto, {
				name: 'Maria Souza',
				phone: '22999990001',
				email: 'maria@trabalhalagos.com',
				password: 'Senha@123',
				city: 'Cabo Frio',
				role: 'ADMIN' as RegisterDto['role'],
			});

			expect(hasPropertyError(errors, 'role')).toBe(true);
		});

		it('rejects invalid phone format', () => {
			const errors = getValidationErrors(RegisterDto, {
				name: 'Maria Souza',
				phone: '11111111111',
				email: 'maria@trabalhalagos.com',
				password: 'Senha@123',
				city: 'Cabo Frio',
				role: 'CANDIDATE',
			});

			expect(hasPropertyError(errors, 'phone')).toBe(true);
		});

		it('rejects weak password', () => {
			const errors = getValidationErrors(RegisterDto, {
				name: 'Maria Souza',
				phone: '22999990001',
				email: 'maria@trabalhalagos.com',
				password: 'senha1234',
				city: 'Cabo Frio',
				role: 'CANDIDATE',
			});

			expect(hasPropertyError(errors, 'password')).toBe(true);
		});

		it('requires email', () => {
			const errors = getValidationErrors(RegisterDto, {
				name: 'Maria Souza',
				phone: '22999990001',
				password: 'Senha@123',
				city: 'Cabo Frio',
				role: 'CANDIDATE',
			});

			expect(hasPropertyError(errors, 'email')).toBe(true);
		});
	});

	describe(LoginDto.name, () => {
		it('accepts valid payload', () => {
			const errors = getValidationErrors(LoginDto, {
				phone: '22999990001',
				password: 'senha@123',
			});

			expect(errors).toHaveLength(0);
		});

		it('rejects phone shorter than minimum length', () => {
			const errors = getValidationErrors(LoginDto, {
				phone: '2299999',
				password: 'senha@123',
			});

			expect(hasPropertyError(errors, 'phone')).toBe(true);
		});

		it('rejects empty password', () => {
			const errors = getValidationErrors(LoginDto, {
				phone: '22999990001',
				password: '',
			});

			expect(hasPropertyError(errors, 'password')).toBe(true);
		});
	});

	describe(RefreshTokenDto.name, () => {
		it('accepts valid refresh token payload', () => {
			const errors = getValidationErrors(RefreshTokenDto, {
				refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
			});

			expect(errors).toHaveLength(0);
		});

		it('rejects empty refresh token', () => {
			const errors = getValidationErrors(RefreshTokenDto, {
				refreshToken: '',
			});

			expect(hasPropertyError(errors, 'refreshToken')).toBe(true);
		});
	});
});
