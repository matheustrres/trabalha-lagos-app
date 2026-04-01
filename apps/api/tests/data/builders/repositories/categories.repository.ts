import { MockProxy, mock } from 'vitest-mock-extended';

import { CategoriesRepository } from '@/modules/categories/categories.repository';

export function makeCategoriesRepositoryMock(): MockProxy<CategoriesRepository> {
	return mock<CategoriesRepository>();
}
