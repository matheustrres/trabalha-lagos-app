import {
	BadRequestException,
	ConflictException,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type MockProxy } from 'vitest-mock-extended';

import { AuthService } from '@/modules/auth/auth.service';
import { CompaniesService } from '@/modules/companies/companies.service';
import { UsersService } from '@/modules/users/users.service';

import { EnvService } from '@/shared/modules/env/env.service';

import { aLoginDto } from '#/data/builders/dtos/login.dto.builder';
import { aRegisterDto } from '#/data/builders/dtos/register.dto.builder';
import { aUser, type CreatedUser } from '#/data/builders/user.builder';
import { makeCompaniesServiceMock } from '#/data/mocks/companies.service.mock';
import { makeJwtServiceMock } from '#/data/mocks/jwt.service.mock';
import { makeUsersServiceMock } from '#/data/mocks/users.service.mock';
import { makeEnvServiceStub } from '#/data/stubs/env.service.stub';

vi.mock('argon2', () => ({
	hash: vi.fn(),
	verify: vi.fn(),
}));

// Drizzle infers the create return type from .returning() — cast through CreatedUser
// to avoid repeating the complex generic everywhere.
type CreateReturn = Awaited<ReturnType<UsersService['create']>>;
const asCreateReturn = (u: CreatedUser): CreateReturn =>
	u as unknown as CreateReturn;

describe(AuthService.name, () => {
	let SUT: AuthService;
	let usersService: MockProxy<UsersService>;
	let companiesService: MockProxy<CompaniesService>;
	let jwtService: MockProxy<JwtService>;
	let envService: MockProxy<EnvService>;

	beforeEach(() => {
		vi.clearAllMocks();

		usersService = makeUsersServiceMock();
		companiesService = makeCompaniesServiceMock();
		jwtService = makeJwtServiceMock();
		envService = makeEnvServiceStub();

		SUT = new AuthService(
			usersService,
			companiesService,
			jwtService,
			envService,
		);
	});

	// ─── register ──────────────────────────────────────────────────────────────

	describe('register', () => {
		it('returns tokens and user data when email is available', async () => {
			const dto = aRegisterDto().build();
			const userBuilder = aUser();

			usersService.findByEmail.mockResolvedValue(null);
			vi.mocked(argon2.hash).mockResolvedValue('$argon2id$mock-hash' as never);
			usersService.create.mockResolvedValue(
				asCreateReturn(userBuilder.buildCreated()),
			);

			const result = await SUT.register(dto);

			expect(result.accessToken).toBe('signed-token');
			expect(result.refreshToken).toBe('signed-token');
			expect(result.user).toEqual({
				id: userBuilder.build().id,
				name: userBuilder.build().name,
				email: userBuilder.build().email,
				phone: userBuilder.build().phone,
				city: userBuilder.build().city,
				role: userBuilder.build().role,
			});
		});

		it('hashes the password before storing (never stores raw password)', async () => {
			const dto = aRegisterDto().withPassword('senha@123').build();
			const hash = '$argon2id$hashed';

			usersService.findByEmail.mockResolvedValue(null);
			vi.mocked(argon2.hash).mockResolvedValue(hash as never);
			usersService.create.mockResolvedValue(
				asCreateReturn(aUser().withPasswordHash(hash).buildCreated()),
			);

			await SUT.register(dto);

			expect(argon2.hash).toHaveBeenCalledWith('senha@123');
			const createArg = usersService.create.mock.calls[0]?.[0];
			expect(createArg).not.toHaveProperty('password');
			expect(createArg).toHaveProperty('passwordHash', hash);
		});

		it('generates both access and refresh tokens on success', async () => {
			const dto = aRegisterDto().build();

			usersService.findByEmail.mockResolvedValue(null);
			vi.mocked(argon2.hash).mockResolvedValue('$argon2id$hash' as never);
			usersService.create.mockResolvedValue(
				asCreateReturn(aUser().buildCreated()),
			);

			await SUT.register(dto);

			expect(jwtService.signAsync).toHaveBeenCalledTimes(2);
			const [accessCall, refreshCall] = jwtService.signAsync.mock.calls;
			expect(accessCall?.[1]).toMatchObject({ secret: 'test-secret' });
			expect(refreshCall?.[1]).toMatchObject({ secret: 'test-refresh-secret' });
		});

		it('throws ConflictException when email is already registered', async () => {
			const dto = aRegisterDto().build();

			usersService.findByEmail.mockResolvedValue(aUser().build());

			await expect(SUT.register(dto)).rejects.toThrow(ConflictException);
			expect(usersService.create).not.toHaveBeenCalled();
			expect(argon2.hash).not.toHaveBeenCalled();
		});

		it('creates an employer without personal phone and maps company fields', async () => {
			const dto = {
				...aRegisterDto().withRole('EMPLOYER').build(),
				phone: undefined,
				document: '11222333000181',
				companyName: 'Pousada Beira Mar',
				segment: 'HOTEL',
				companyWhatsapp: '22999990002',
			};
			const employer = aUser()
				.withRole('EMPLOYER')
				.withPhone(null)
				.buildCreated();

			usersService.findByEmail.mockResolvedValue(null);
			vi.mocked(argon2.hash).mockResolvedValue('$argon2id$hash' as never);
			usersService.create.mockResolvedValue(asCreateReturn(employer));

			await SUT.register(dto);

			expect(usersService.create).toHaveBeenCalledWith(
				expect.objectContaining({ phone: undefined, role: 'EMPLOYER' }),
			);
			expect(companiesService.create).toHaveBeenCalledWith(employer.id, {
				name: 'Pousada Beira Mar',
				city: dto.city,
				whatsapp: '22999990002',
				document: '11222333000181',
				segment: 'HOTEL',
			});
		});

		it('rejects a personal phone for employers', async () => {
			const dto = {
				...aRegisterDto().withRole('EMPLOYER').build(),
				document: '11222333000181',
				companyName: 'Pousada Beira Mar',
			};

			usersService.findByEmail.mockResolvedValue(null);

			await expect(SUT.register(dto)).rejects.toThrow(BadRequestException);
			expect(usersService.create).not.toHaveBeenCalled();
		});
	});

	// ─── login ─────────────────────────────────────────────────────────────────

	describe('login', () => {
		it('returns tokens and user data when credentials are valid', async () => {
			const dto = aLoginDto().build();
			const user = aUser().build();

			usersService.findByEmail.mockResolvedValue(user);
			vi.mocked(argon2.verify).mockResolvedValue(true as never);

			const result = await SUT.login(dto);

			expect(result.accessToken).toBeDefined();
			expect(result.refreshToken).toBeDefined();
			expect(result.user.id).toBe(user.id);
			expect(result.user.role).toBe(user.role);
		});

		it('throws UnauthorizedException when email is not registered', async () => {
			const dto = aLoginDto().build();

			usersService.findByEmail.mockResolvedValue(null);

			await expect(SUT.login(dto)).rejects.toThrow(UnauthorizedException);
			expect(argon2.verify).not.toHaveBeenCalled();
		});

		it('throws UnauthorizedException when password is wrong', async () => {
			const dto = aLoginDto().build();

			usersService.findByEmail.mockResolvedValue(aUser().build());
			vi.mocked(argon2.verify).mockResolvedValue(false as never);

			await expect(SUT.login(dto)).rejects.toThrow(UnauthorizedException);
			expect(jwtService.signAsync).not.toHaveBeenCalled();
		});

		it('returns same error for missing user and wrong password (no user enumeration)', async () => {
			const dto = aLoginDto().build();

			usersService.findByEmail.mockResolvedValue(null);
			const notFoundError = await SUT.login(dto).catch(
				(e: UnauthorizedException) => e,
			);

			usersService.findByEmail.mockResolvedValue(aUser().build());
			vi.mocked(argon2.verify).mockResolvedValue(false as never);
			const wrongPwError = await SUT.login(dto).catch(
				(e: UnauthorizedException) => e,
			);

			expect((notFoundError as UnauthorizedException).message).toBe(
				(wrongPwError as UnauthorizedException).message,
			);
		});
	});

	// ─── refresh ───────────────────────────────────────────────────────────────

	describe('refresh', () => {
		it('returns a new token pair when refresh token is valid', async () => {
			const user = aUser().build();

			jwtService.verify.mockReturnValue({ sub: user.id, role: user.role });
			usersService.findById.mockResolvedValue(user);

			const result = await SUT.refresh('valid-refresh-token');

			expect(result.accessToken).toBe('signed-token');
			expect(result.refreshToken).toBe('signed-token');
			expect(jwtService.verify).toHaveBeenCalledWith(
				'valid-refresh-token',
				expect.objectContaining({ secret: 'test-refresh-secret' }),
			);
		});

		it('throws UnauthorizedException when refresh token is malformed or expired', async () => {
			jwtService.verify.mockImplementation(() => {
				throw new Error('jwt expired');
			});

			await expect(SUT.refresh('expired-token')).rejects.toThrow(
				UnauthorizedException,
			);
		});

		it('throws UnauthorizedException when the user no longer exists', async () => {
			jwtService.verify.mockReturnValue({ sub: 'ghost-id', role: 'CANDIDATE' });
			usersService.findById.mockResolvedValue(null);

			await expect(SUT.refresh('valid-token')).rejects.toThrow(
				UnauthorizedException,
			);
		});

		it('rejects refresh tokens issued before the password change', async () => {
			const user = aUser().build();
			jwtService.verify.mockReturnValue({
				sub: user.id,
				role: user.role,
				credentialsVersion: user.credentialsVersion - 1,
			});
			usersService.findById.mockResolvedValue(user);

			await expect(SUT.refresh('old-refresh-token')).rejects.toThrow(
				UnauthorizedException,
			);
		});

		it('generates new tokens using the verified token payload', async () => {
			const user = aUser().withId('user-uuid-1').withRole('EMPLOYER').build();

			jwtService.verify.mockReturnValue({ sub: user.id, role: user.role });
			usersService.findById.mockResolvedValue(user);

			await SUT.refresh('valid-token');

			expect(usersService.findById).toHaveBeenCalledWith(user.id);
			expect(jwtService.signAsync.mock.calls[0]?.[0]).toMatchObject({
				sub: user.id,
				role: 'EMPLOYER',
			});
		});
	});

	describe('updatePassword', () => {
		it('verifies and hashes the new password, then returns a rotated token pair', async () => {
			const original = aUser().build();
			const updated = {
				...original,
				credentialsVersion: original.credentialsVersion + 1,
			};
			usersService.findByIdOrFail.mockResolvedValue(original);
			vi.mocked(argon2.verify).mockResolvedValue(true as never);
			vi.mocked(argon2.hash).mockResolvedValue('$argon2id$new-hash' as never);
			usersService.updateCredentials.mockResolvedValue(updated);

			const result = await SUT.updatePassword(
				original.id,
				'old-pass',
				'New-pass1!',
			);

			expect(argon2.verify).toHaveBeenCalledWith(
				original.passwordHash,
				'old-pass',
			);
			expect(argon2.hash).toHaveBeenCalledWith('New-pass1!');
			expect(usersService.updateCredentials).toHaveBeenCalledWith(
				original.id,
				'$argon2id$new-hash',
			);
			expect(jwtService.signAsync.mock.calls[0]?.[0]).toMatchObject({
				credentialsVersion: updated.credentialsVersion,
			});
			expect(result.user.id).toBe(original.id);
		});

		it('rejects an incorrect current password without changing credentials', async () => {
			const user = aUser().build();
			usersService.findByIdOrFail.mockResolvedValue(user);
			vi.mocked(argon2.verify).mockResolvedValue(false as never);

			await expect(
				SUT.updatePassword(user.id, 'wrong', 'New-pass1!'),
			).rejects.toThrow(BadRequestException);
			expect(usersService.updateCredentials).not.toHaveBeenCalled();
		});
	});
});
