import type { INestApplication } from '@nestjs/common';
import { uuidv7 } from 'uuidv7';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createAppFixture } from '../__helpers/app-fixture';

import { CompaniesRepository } from '@/modules/companies/companies.repository';

import type { Database } from '@/shared/modules/database/database.provider';
import { users } from '@/shared/modules/database/schema';

describe('CompaniesRepository (integration)', () => {
	let app: INestApplication;
	let db: Database;
	let companiesRepository: CompaniesRepository;

	beforeAll(async () => {
		({ app, db } = await createAppFixture({ shouldClearAllDb: true }));
		companiesRepository = app.get(CompaniesRepository);
	});

	afterAll(async () => {
		await app.close();
	});

	async function createEmployerUser(suffix: string): Promise<{ id: string }> {
		const [user] = await db
			.insert(users)
			.values({
				name: `Employer ${suffix}`,
				phone: `2299999${suffix}`,
				passwordHash: '$argon2id$mock-hash',
				role: 'EMPLOYER',
				city: 'Cabo Frio',
			})
			.returning({ id: users.id });

		return { id: user!.id };
	}

	describe('create + findByUserId', () => {
		it('creates company with FREE plan and finds by user id', async () => {
			const user = await createEmployerUser('0001');

			const created = await companiesRepository.create({
				userId: user.id,
				name: 'Empresa Repositorio',
				document: '11222333000181',
				city: 'Cabo Frio',
				whatsapp: '22999990001',
			});

			expect(created.userId).toBe(user.id);
			expect(created.plan).toBe('FREE');

			const found = await companiesRepository.findByUserId(user.id);

			expect(found).not.toBeNull();
			expect(found?.id).toBe(created.id);
			expect(found?.name).toBe('Empresa Repositorio');
		});
	});

	describe('findById', () => {
		it('returns company with user projection when id exists', async () => {
			const user = await createEmployerUser('0002');
			const created = await companiesRepository.create({
				userId: user.id,
				name: 'Empresa com User',
				document: '11222333000181',
				city: 'Arraial do Cabo',
				whatsapp: '22999990002',
			});

			const found = await companiesRepository.findById(created.id);

			expect(found).not.toBeNull();
			expect(found?.id).toBe(created.id);
			expect(found?.user).toMatchObject({
				id: user.id,
				name: 'Employer 0002',
				phone: '22999990002',
				city: 'Cabo Frio',
			});
		});

		it('returns null when company id does not exist', async () => {
			const notFound = await companiesRepository.findById(uuidv7());

			expect(notFound).toBeNull();
		});
	});

	describe('update', () => {
		it('updates company fields and keeps updatedAt as date', async () => {
			const user = await createEmployerUser('0003');
			const created = await companiesRepository.create({
				userId: user.id,
				name: 'Empresa Antiga',
				document: '11222333000181',
				city: 'Búzios',
				whatsapp: '22999990003',
			});

			const updated = await companiesRepository.update(created.id, {
				name: 'Empresa Nova',
				segment: 'Turismo',
				logoUrl: 'https://example.com/logo.png',
			});

			expect(updated).not.toBeNull();
			expect(updated?.name).toBe('Empresa Nova');
			expect(updated?.segment).toBe('Turismo');
			expect(updated?.logoUrl).toBe('https://example.com/logo.png');
			expect(updated?.updatedAt).toBeInstanceOf(Date);
			expect(updated!.updatedAt.getTime()).toBeGreaterThanOrEqual(
				created.updatedAt.getTime(),
			);
		});

		it('returns null when updating non-existent company', async () => {
			const result = await companiesRepository.update(uuidv7(), {
				name: 'Inexistente',
			});

			expect(result).toBeNull();
		});
	});
});
