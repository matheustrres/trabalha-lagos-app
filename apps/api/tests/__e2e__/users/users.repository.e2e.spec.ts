import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createAppFixture } from '../__helpers/app-fixture';

import { UsersRepository } from '@/modules/users/users.repository';

describe('UsersRepository (integration)', () => {
	let app: INestApplication;
	let usersRepository: UsersRepository;

	beforeAll(async () => {
		({ app } = await createAppFixture({ shouldClearAllDb: true }));
		usersRepository = app.get(UsersRepository);
	});

	afterAll(async () => {
		await app.close();
	});

	describe('create + findByPhone + findByEmail + findById', () => {
		it('creates a candidate user and finds by all lookup methods', async () => {
			const created = await usersRepository.create({
				name: 'João Candidate',
				phone: '22970000001',
				email: 'joao.candidate@email.com',
				passwordHash: '$argon2id$mock-hash',
				city: 'Cabo Frio',
				role: 'CANDIDATE',
			});

			expect(created.id).toBeDefined();
			expect(created.role).toBe('CANDIDATE');

			const byPhone = await usersRepository.findByPhone('22970000001');
			expect(byPhone?.id).toBe(created.id);

			const byEmail = await usersRepository.findByEmail(
				'joao.candidate@email.com',
			);
			expect(byEmail?.id).toBe(created.id);

			const byId = await usersRepository.findById(created.id);
			expect(byId?.phone).toBe('22970000001');
		});

		it('supports nullable email and still finds by phone/id', async () => {
			const created = await usersRepository.create({
				name: 'Maria Employer',
				phone: '22970000002',
				passwordHash: '$argon2id$mock-hash',
				city: 'Búzios',
				role: 'EMPLOYER',
			});

			expect(created.email).toBeNull();

			const byPhone = await usersRepository.findByPhone('22970000002');
			expect(byPhone?.id).toBe(created.id);

			const byId = await usersRepository.findById(created.id);
			expect(byId?.city).toBe('Búzios');
		});
	});

	describe('not found cases', () => {
		it('returns null for unknown phone/email/id', async () => {
			const byPhone = await usersRepository.findByPhone('22979999999');
			const byEmail = await usersRepository.findByEmail('ghost@email.com');
			const byId = await usersRepository.findById(
				'00000000-0000-0000-0000-000000000000',
			);

			expect(byPhone).toBeNull();
			expect(byEmail).toBeNull();
			expect(byId).toBeNull();
		});
	});
});
