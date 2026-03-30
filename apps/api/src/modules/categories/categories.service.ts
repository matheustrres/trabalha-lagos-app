import { Injectable, NotFoundException } from '@nestjs/common';

import { CategoriesRepository } from './categories.repository';

@Injectable()
export class CategoriesService {
	constructor(private readonly categoriesRepository: CategoriesRepository) {}

	async findAll() {
		return this.categoriesRepository.findAll();
	}

	async findBySlug(slug: string) {
		const category = await this.categoriesRepository.findBySlug(slug);
		if (!category) {
			throw new NotFoundException(`Categoria "${slug}" não encontrada`);
		}
		return category;
	}
}
