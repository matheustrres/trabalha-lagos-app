import { InternalServerErrorException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { mock, type MockProxy } from 'vitest-mock-extended';

import { CategoriesController } from '@/modules/categories/categories.controller';
import { CategoriesService } from '@/modules/categories/categories.service';

import { aCategory } from '#/data/builders/category.builder';

describe(CategoriesController.name, () => {
	let SUT: CategoriesController;
	let categoriesService: MockProxy<CategoriesService>;

	beforeEach(() => {
		categoriesService = mock<CategoriesService>();
		SUT = new CategoriesController(categoriesService);
	});

	describe('findAll', () => {
		it('delegates to categoriesService.findAll and returns its response', async () => {
			const categories = [
				aCategory().withId(1).withName('Turismo').build(),
				aCategory().withId(2).withName('Construção').build(),
			];

			categoriesService.findAll.mockResolvedValue(categories);

			const result = await SUT.findAll();

			expect(categoriesService.findAll).toHaveBeenCalledTimes(1);
			expect(result).toEqual(categories);
		});

		it('propagates service errors', async () => {
			categoriesService.findAll.mockRejectedValue(
				new InternalServerErrorException('DB failure'),
			);

			await expect(SUT.findAll()).rejects.toThrow(InternalServerErrorException);
		});
	});
});
