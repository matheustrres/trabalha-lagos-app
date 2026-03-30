import { mock, type MockProxy } from 'vitest-mock-extended';

import { UsersService } from '@/modules/users/users.service';

export function makeUsersServiceMock(): MockProxy<UsersService> {
	return mock<UsersService>();
}
