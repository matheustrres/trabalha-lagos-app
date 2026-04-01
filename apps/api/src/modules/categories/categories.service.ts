import { Injectable, NotFoundException } from '@nestjs/common';

import { CategoriesRepository, CategoryRow } from './categories.repository';

import { CategorySchema } from '@/shared/modules/database/schema';

@Injectable()
export class CategoriesService {
	constructor(private readonly categoriesRepository: CategoriesRepository) {}

	async findAll(): Promise<CategoryRow[]> {
		return this.categoriesRepository.findAll();
	}

	async findBySlug(slug: string): Promise<CategorySchema | null> {
		const category = await this.categoriesRepository.findBySlug(slug);
		if (!category) {
			throw new NotFoundException(`Categoria "${slug}" não encontrada`);
		}
		return category;
	}
}
