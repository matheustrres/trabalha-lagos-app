import { Global, Module } from '@nestjs/common';

import { RedisProvider, RedisProviderFactory } from './redis.provider';

import { EnvModule } from '@/shared/modules/env/env.module';

@Global()
@Module({
	imports: [EnvModule],
	providers: [RedisProvider, RedisProviderFactory],
	exports: [RedisProvider, RedisProviderFactory],
})
export class RedisModule {}
