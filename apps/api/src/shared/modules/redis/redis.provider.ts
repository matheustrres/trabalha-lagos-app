import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import Redis, { type RedisOptions } from 'ioredis';

import { EnvService } from '../env/env.service';

export const REDIS_TOKEN = Symbol('REDIS');

@Injectable()
export class RedisProvider implements OnApplicationShutdown {
	private client?: Redis;

	constructor(private readonly envService: EnvService) {}

	getClient(): Redis {
		if (this.client) {
			return this.client;
		}

		const host = this.envService.getKey('REDIS_HOST') ?? 'localhost';
		const port = this.envService.getKey('REDIS_PORT') ?? 6379;
		const password = this.envService.getKey('REDIS_PASSWORD');

		const options: RedisOptions = {
			host,
			port,
			lazyConnect: true,
		};

		if (password) {
			options.password = password;
		}

		this.client = new Redis(options);

		return this.client;
	}

	onApplicationShutdown(): void {
		this.client?.disconnect(false);
	}
}

export const RedisProviderFactory = {
	provide: REDIS_TOKEN,
	useFactory: (provider: RedisProvider): Redis => {
		return provider.getClient();
	},
	inject: [RedisProvider],
};
