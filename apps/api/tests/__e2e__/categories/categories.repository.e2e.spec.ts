import type { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createAppFixture } from '../__helpers/app-fixture';

import { CategoriesRepository } from '@/modules/categories/categories.repository';

describe('CategoriesRepository (integration)', () => {
	let app: INestApplication;
	let categoriesRepository: CategoriesRepository;

	beforeAll(async () => {
		({ app } = await createAppFixture({ shouldClearAllDb: true }));
		categoriesRepository = app.get(CategoriesRepository);
	});

	afterAll(async () => {
		await app.close();
	});

	describe('findAll', () => {
		it('returns seeded categories with aggregated jobCount ordered by order', async () => {
			const result = await categoriesRepository.findAll();

			expect(result.length).toBeGreaterThan(0);
			expect(result[0]).toMatchObject({
				id: expect.any(Number),
				name: expect.any(String),
				slug: expect.any(String),
				icon: expect.any(String),
				order: expect.any(Number),
				jobCount: expect.any(Number),
			});

			const orders = result.map((item) => item.order);
			expect(orders).toEqual([...orders].sort((a, b) => a - b));
		});
	});

	describe('findBySlug', () => {
		it('returns category when slug exists', async () => {
			const result = await categoriesRepository.findBySlug(
				'turismo-hospitalidade',
			);

			expect(result).not.toBeNull();
			expect(result?.slug).toBe('turismo-hospitalidade');
		});

		it('returns null when slug does not exist', async () => {
			const result = await categoriesRepository.findBySlug('nao-existe');

			expect(result).toBeNull();
		});
	});
});
