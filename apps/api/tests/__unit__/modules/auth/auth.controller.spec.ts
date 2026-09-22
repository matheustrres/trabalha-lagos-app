import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { mock, type MockProxy } from 'vitest-mock-extended';

import { AuthController } from '@/modules/auth/auth.controller';
import { AuthService } from '@/modules/auth/auth.service';

import { aLoginDto } from '#/data/builders/dtos/login.dto.builder';
import { aRegisterDto } from '#/data/builders/dtos/register.dto.builder';

const authResponse = {
	accessToken: 'access-token',
	refreshToken: 'refresh-token',
	user: {
		id: 'user-uuid-1',
		name: 'Maria Souza',
		email: 'maria@email.com',
		phone: '22999990001',
		city: 'Cabo Frio',
		role: 'CANDIDATE',
	},
};

describe(AuthController.name, () => {
	let SUT: AuthController;
	let authService: MockProxy<AuthService>;

	beforeEach(() => {
		authService = mock<AuthService>();
		SUT = new AuthController(authService);
	});

	describe('register', () => {
		it('delegates to authService.register and returns its response', async () => {
			const dto = aRegisterDto().build();
			authService.register.mockResolvedValue(authResponse);

			const result = await SUT.register(dto);

			expect(authService.register).toHaveBeenCalledWith(dto);
			expect(result).toEqual(authResponse);
		});

		it('propagates service errors', async () => {
			const dto = aRegisterDto().build();
			authService.register.mockRejectedValue(
				new ConflictException('Telefone já cadastrado.'),
			);

			await expect(SUT.register(dto)).rejects.toThrow(ConflictException);
		});
	});

	describe('login', () => {
		it('delegates to authService.login and returns its response', async () => {
			const dto = aLoginDto().build();
			authService.login.mockResolvedValue(authResponse);

			const result = await SUT.login(dto);

			expect(authService.login).toHaveBeenCalledWith(dto);
			expect(result).toEqual(authResponse);
		});

		it('propagates service errors', async () => {
			const dto = aLoginDto().build();
			authService.login.mockRejectedValue(
				new UnauthorizedException('Credenciais inválidas.'),
			);

			await expect(SUT.login(dto)).rejects.toThrow(UnauthorizedException);
		});
	});

	describe('refresh', () => {
		it('delegates only refreshToken to authService.refresh and returns its response', async () => {
			const dto = { refreshToken: 'valid-refresh-token' };
			authService.refresh.mockResolvedValue(authResponse);

			const result = await SUT.refresh(dto);

			expect(authService.refresh).toHaveBeenCalledWith('valid-refresh-token');
			expect(result).toEqual(authResponse);
		});
	});
});
