import * as argon2 from 'argon2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type MockProxy } from 'vitest-mock-extended';

vi.mock('argon2', () => ({ verify: vi.fn() }));

import { UsersRepository } from '@/modules/users/users.repository';
import { UsersService } from '@/modules/users/users.service';

import { makeUsersRepositoryMock } from '#/data/builders/repositories/users.repository';
import { aUser, type CreatedUser } from '#/data/builders/user.builder';

// Drizzle infers the create return type from .returning() — cast through CreatedUser.
type CreateReturn = Awaited<ReturnType<UsersRepository['create']>>;
const asCreateReturn = (u: CreatedUser): CreateReturn =>
	u as unknown as CreateReturn;

describe(UsersService.name, () => {
	let SUT: UsersService;
	let usersRepository: MockProxy<UsersRepository>;

	beforeEach(() => {
		vi.mocked(argon2.verify).mockReset();
		usersRepository = makeUsersRepositoryMock();
		SUT = new UsersService(usersRepository);
	});

	describe('updateEmail', () => {
		it('validates the current password and stores a normalized email', async () => {
			const user = aUser().withEmail('ana@email.com').build();
			const updated = { ...user, email: 'novo@email.com' };
			usersRepository.findById.mockResolvedValue(user);
			usersRepository.findByEmail.mockResolvedValue(null);
			usersRepository.updateEmail.mockResolvedValue(updated);
			vi.mocked(argon2.verify).mockResolvedValue(true);

			const result = await SUT.updateEmail(
				user.id,
				' Novo@Email.com ',
				'senha',
			);

			expect(result.email).toBe('novo@email.com');
			expect(usersRepository.updateEmail).toHaveBeenCalledWith(
				user.id,
				'novo@email.com',
			);
		});

		it('rejects an invalid current password', async () => {
			const user = aUser().build();
			usersRepository.findById.mockResolvedValue(user);
			vi.mocked(argon2.verify).mockResolvedValue(false);

			await expect(
				SUT.updateEmail(user.id, 'novo@email.com', 'errada'),
			).rejects.toThrow('Senha atual inválida.');
			expect(usersRepository.updateEmail).not.toHaveBeenCalled();
		});

		it('rejects an email already used by another account', async () => {
			const user = aUser().withEmail('ana@email.com').build();
			usersRepository.findById.mockResolvedValue(user);
			usersRepository.findByEmail.mockResolvedValue(
				aUser().withEmail('outro@email.com').build(),
			);
			vi.mocked(argon2.verify).mockResolvedValue(true);

			await expect(
				SUT.updateEmail(user.id, 'outro@email.com', 'senha'),
			).rejects.toThrow('Este e-mail já está em uso.');
			expect(usersRepository.updateEmail).not.toHaveBeenCalled();
		});
	});

	// ─── findByPhone ───────────────────────────────────────────────────────────

	describe('findByPhone', () => {
		it('returns the user when found', async () => {
			const user = aUser().withPhone('22988887777').build();

			usersRepository.findByPhone.mockResolvedValue(user);

			const result = await SUT.findByPhone('22988887777');

			expect(result).toEqual(user);
			expect(usersRepository.findByPhone).toHaveBeenCalledWith('22988887777');
		});

		it('returns null when user does not exist', async () => {
			usersRepository.findByPhone.mockResolvedValue(null);

			const result = await SUT.findByPhone('00000000000');

			expect(result).toBeNull();
		});

		it('propagates unexpected repository errors', async () => {
			const dbError = new Error('database unavailable');
			usersRepository.findByPhone.mockRejectedValue(dbError);

			await expect(SUT.findByPhone('22999990001')).rejects.toThrow(dbError);
		});
	});

	// ─── findByEmail ───────────────────────────────────────────────────────────

	describe('findByEmail', () => {
		it('returns the user when found', async () => {
			const user = aUser().withEmail('ana@email.com').build();

			usersRepository.findByEmail.mockResolvedValue(user);

			const result = await SUT.findByEmail('ana@email.com');

			expect(result).toEqual(user);
			expect(usersRepository.findByEmail).toHaveBeenCalledWith('ana@email.com');
		});

		it('returns null when email is not registered', async () => {
			usersRepository.findByEmail.mockResolvedValue(null);

			const result = await SUT.findByEmail('ghost@email.com');

			expect(result).toBeNull();
		});
	});

	// ─── findById ──────────────────────────────────────────────────────────────

	describe('findById', () => {
		it('returns the user when found', async () => {
			const user = aUser().withId('user-uuid-1').build();

			usersRepository.findById.mockResolvedValue(user);

			const result = await SUT.findById(user.id);

			expect(result).toEqual(user);
			expect(usersRepository.findById).toHaveBeenCalledWith(user.id);
		});

		it('returns null when ID does not exist', async () => {
			usersRepository.findById.mockResolvedValue(null);

			const result = await SUT.findById('nonexistent-id');

			expect(result).toBeNull();
		});
	});

	// ─── create ────────────────────────────────────────────────────────────────

	describe('create', () => {
		it('delegates to repository and returns the created user', async () => {
			const input = {
				name: 'Ana Lima',
				phone: '22988887777',
				email: 'ana@email.com',
				passwordHash: '$argon2id$mock',
				city: 'Búzios',
				role: 'CANDIDATE' as const,
			};
			const created = aUser()
				.withName(input.name)
				.withPhone(input.phone)
				.withCity(input.city)
				.withRole(input.role)
				.buildCreated();

			usersRepository.create.mockResolvedValue(asCreateReturn(created));

			const result = await SUT.create(input);

			expect(result).toEqual(created);
			expect(usersRepository.create).toHaveBeenCalledWith(input);
		});

		it('propagates unexpected repository errors', async () => {
			const input = {
				name: 'Ana Lima',
				phone: '22988887777',
				email: 'ana@email.com',
				passwordHash: '$argon2id$mock',
				city: 'Búzios',
				role: 'CANDIDATE' as const,
			};
			const dbError = new Error('insert failed');

			usersRepository.create.mockRejectedValue(dbError);

			await expect(SUT.create(input)).rejects.toThrow(dbError);
		});
	});

	describe('updateProfile', () => {
		it('updates the candidate WhatsApp', async () => {
			const user = aUser().withPhone('22988887777').build();
			usersRepository.updateProfile.mockResolvedValue(user);

			const result = await SUT.updateProfile(user.id, {
				phone: '22988887777',
			});

			expect(result).toEqual(user);
			expect(usersRepository.updateProfile).toHaveBeenCalledWith(user.id, {
				phone: '22988887777',
			});
		});

		it('allows removing the candidate WhatsApp', async () => {
			const user = aUser().withPhone(null).build();
			usersRepository.updateProfile.mockResolvedValue(user);

			const result = await SUT.updateProfile(user.id, { phone: null });

			expect(result.phone).toBeNull();
			expect(usersRepository.updateProfile).toHaveBeenCalledWith(user.id, {
				phone: null,
			});
		});
	});
});
