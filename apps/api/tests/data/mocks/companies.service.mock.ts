import { mock, type MockProxy } from 'vitest-mock-extended';

import { CompaniesService } from '@/modules/companies/companies.service';

export function makeCompaniesServiceMock(): MockProxy<CompaniesService> {
	return mock<CompaniesService>();
}
