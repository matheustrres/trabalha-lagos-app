import Redis from 'ioredis';
import { mock, MockProxy } from 'vitest-mock-extended';

export function makeRedisServiceMock(): MockProxy<Redis> {
	return mock<Redis>();
}
