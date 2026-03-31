import { mock, type MockProxy } from 'vitest-mock-extended';

import { JobsRepository } from '@/modules/jobs/jobs.repository';

export function makeJobsRepositoryMock(): MockProxy<JobsRepository> {
	return mock<JobsRepository>();
}
