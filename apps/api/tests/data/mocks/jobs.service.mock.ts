import { mock, type MockProxy } from 'vitest-mock-extended';

import { JobsService } from '@/modules/jobs/jobs.service';

export function makeJobsServiceMock(): MockProxy<JobsService> {
	return mock<JobsService>();
}
