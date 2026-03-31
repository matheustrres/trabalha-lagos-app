import { Injectable } from '@nestjs/common';
import Redis, { type RedisOptions } from 'ioredis';

import { EnvService } from '../env/env.service';

export const REDIS_TOKEN = Symbol('REDIS');

@Injectable()
export class RedisProvider {
	constructor(private readonly envService: EnvService) {}

	getClient(): Redis {
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

		return new Redis(options);
	}
}

export const RedisProviderFactory = {
	provide: REDIS_TOKEN,
	useFactory: (provider: RedisProvider): Redis => {
		return provider.getClient();
	},
	inject: [RedisProvider],
};
