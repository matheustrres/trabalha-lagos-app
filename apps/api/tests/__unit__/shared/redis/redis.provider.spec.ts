import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { EnvService } from '@/shared/modules/env/env.service';
import { RedisProvider } from '@/shared/modules/redis/redis.provider';

const { redisClient, RedisConstructor } = vi.hoisted(() => {
	const client = {
		disconnect: vi.fn(),
	};
	const constructor = vi.fn(function RedisMock() {
		return client;
	});

	return { redisClient: client, RedisConstructor: constructor };
});

vi.mock('ioredis', () => ({ default: RedisConstructor }));

describe(RedisProvider.name, () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates and reuses a single lazy Redis client', () => {
		const envService = {
			getKey: vi.fn((key: string) => {
				if (key === 'REDIS_HOST') return 'redis.internal';
				if (key === 'REDIS_PORT') return 6380;
				if (key === 'REDIS_PASSWORD') return 'secret';
				return undefined;
			}),
		} as unknown as EnvService;
		const provider = new RedisProvider(envService);

		const firstClient = provider.getClient();
		const secondClient = provider.getClient();

		expect(firstClient).toBe(redisClient);
		expect(secondClient).toBe(redisClient);
		expect(RedisConstructor).toHaveBeenCalledOnce();
		expect(RedisConstructor).toHaveBeenCalledWith({
			host: 'redis.internal',
			port: 6380,
			password: 'secret',
			lazyConnect: true,
		});
	});

	it('disconnects the shared client during application shutdown', () => {
		const envService = {
			getKey: vi.fn(() => undefined),
		} as unknown as EnvService;
		const provider = new RedisProvider(envService);
		provider.getClient();

		provider.onApplicationShutdown();

		expect(redisClient.disconnect).toHaveBeenCalledWith(false);
	});
});
