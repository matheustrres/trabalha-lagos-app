import { MockProxy, mock } from 'vitest-mock-extended';

import { InterestsRepository } from '@/modules/interests/interests.repository';

export function makeInterestsRepositoryMock(): MockProxy<InterestsRepository> {
	return mock<InterestsRepository>();
}
