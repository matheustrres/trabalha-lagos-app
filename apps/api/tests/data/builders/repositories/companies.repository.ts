import { MockProxy, mock } from 'vitest-mock-extended';

import { CompaniesRepository } from '@/modules/companies/companies.repository';

export function makeCompaniesRepositoryMock(): MockProxy<CompaniesRepository> {
	return mock<CompaniesRepository>();
}
