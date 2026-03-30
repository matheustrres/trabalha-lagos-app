import { MockProxy, mock } from 'vitest-mock-extended';

import { UsersRepository } from '@/modules/users/users.repository';

export function makeUsersRepositoryMock(): MockProxy<UsersRepository> {
	return mock<UsersRepository>();
}
