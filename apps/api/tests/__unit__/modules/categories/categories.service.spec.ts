import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { type MockProxy } from 'vitest-mock-extended';

import { CategoriesRepository } from '@/modules/categories/categories.repository';
import { CategoriesService } from '@/modules/categories/categories.service';

import { aCategory } from '#/data/builders/category.builder';
import { makeCategoriesRepositoryMock } from '#/data/builders/repositories/categories.repository';

describe(CategoriesService.name, () => {
	let SUT: CategoriesService;
	let categoriesRepository: MockProxy<CategoriesRepository>;

	beforeEach(() => {
		categoriesRepository = makeCategoriesRepositoryMock();
		SUT = new CategoriesService(categoriesRepository);
	});

	// ─── findAll ───────────────────────────────────────────────────────────────

	describe('findAll', () => {
		it('returns all categories with job counts', async () => {
			const categories = [
				aCategory().withId(1).withName('Turismo').build(),
				aCategory().withId(2).withName('Construção').build(),
			];

			categoriesRepository.findAll.mockResolvedValue(categories);

			const result = await SUT.findAll();

			expect(result).toEqual(categories);
			expect(categoriesRepository.findAll).toHaveBeenCalled();
		});

		it('returns empty array when no categories exist', async () => {
			categoriesRepository.findAll.mockResolvedValue([]);

			const result = await SUT.findAll();

			expect(result).toEqual([]);
		});

		it('propagates unexpected repository errors (e.g. database failure)', async () => {
			const dbError = new Error('database connection lost');
			categoriesRepository.findAll.mockRejectedValue(dbError);

			await expect(SUT.findAll()).rejects.toThrow(dbError);
		});
	});

	// ─── findBySlug ───────────────────────────────────────────────────────────

	describe('findBySlug', () => {
		it('returns the category when found', async () => {
			const category = aCategory().withSlug('turismo-hospitalidade').build();

			categoriesRepository.findBySlug.mockResolvedValue(category as any);

			const result = await SUT.findBySlug('turismo-hospitalidade');

			expect(result).toEqual(category);
			expect(categoriesRepository.findBySlug).toHaveBeenCalledWith(
				'turismo-hospitalidade',
			);
		});

		it('throws NotFoundException when category does not exist', async () => {
			categoriesRepository.findBySlug.mockResolvedValue(null);

			await expect(SUT.findBySlug('invalid-slug')).rejects.toThrow(
				NotFoundException,
			);
		});
	});
});
