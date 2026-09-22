import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, HttpAdapterHost } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';
import type Redis from 'ioredis';
import { LoggerModule } from 'nestjs-pino';
import { uuidv7 } from 'uuidv7';

import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';

import { GlobalThrottlerGuard } from '@/common/guards/global-throttler.guard';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

import { AuthModule } from '@/modules/auth/auth.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { CompaniesModule } from '@/modules/companies/companies.module';
import { InterestsModule } from '@/modules/interests/interests.module';
import { JobsModule } from '@/modules/jobs/jobs.module';
import { UsersModule } from '@/modules/users/users.module';

import { GlobalExceptionFilter } from '@/shared/exceptions/global-exception-filter';
import { DatabaseModule } from '@/shared/modules/database/database.module';
import { EnvModule } from '@/shared/modules/env/env.module';
import { EnvService } from '@/shared/modules/env/env.service';
import { RedisModule } from '@/shared/modules/redis/redis.module';
import { REDIS_TOKEN } from '@/shared/modules/redis/redis.provider';
import { getIpTracker } from '@/shared/utils/get-ip-tracker';

@Module({
	imports: [
		DatabaseModule,
		EnvModule,
		SentryModule.forRoot(),
		RedisModule,
		ScheduleModule.forRoot(),
		BullModule.forRootAsync({
			imports: [EnvModule],
			useFactory: (envService: EnvService) => ({
				connection: {
					host: envService.getKey('REDIS_HOST') ?? 'localhost',
					port: envService.getKey('REDIS_PORT') ?? 6379,
					password: envService.getKey('REDIS_PASSWORD'),
				},
			}),
			inject: [EnvService],
		}),
		ThrottlerModule.forRootAsync({
			imports: [EnvModule, RedisModule],
			inject: [EnvService, REDIS_TOKEN],
			useFactory: (envService: EnvService, redis: Redis) => ({
				throttlers: [
					{ name: 'short', ttl: 1000, limit: 3 },
					{ name: 'medium', ttl: 60000, limit: 60 },
				],
				storage: new ThrottlerStorageRedisService(redis),
				setHeaders: true,
				skipIf: (context) => {
					if (!envService.getKey('THROTTLE_ENABLED')) {
						return true;
					}

					const req = context.switchToHttp().getRequest<{ url?: string }>();
					const url = req?.url ?? '';

					return !url.startsWith('/api/v1');
				},
				getTracker: getIpTracker,
			}),
		}),
		AuthModule,
		UsersModule,
		CompaniesModule,
		CategoriesModule,
		JobsModule,
		InterestsModule,
		LoggerModule.forRoot({
			pinoHttp: {
				autoLogging: false,
				base: null,
				quietResLogger: true,
				genReqId: (request: any) =>
					request?.requestContext?.requestId || uuidv7(),
				serializers: {
					err: (err: any) => {
						const getTrimmedStack = (stack?: string, maxLines: number = 6) => {
							if (!stack) return undefined;
							return stack.split('\n').slice(0, maxLines).join('\n');
						};

						if (!err) return err;

						if (typeof err.getStatus === 'function') {
							const response =
								typeof err.getResponse === 'function'
									? err.getResponse()
									: undefined;
							const statusCode = err.getStatus();

							return {
								type: err.constructor?.name,
								message: err.message,
								statusCode,
								detail: response?.detail ?? response?.message,
								error: response?.error,
								...(statusCode >= 500 && {
									stack: getTrimmedStack(err.stack),
								}),
							};
						}

						if (err.type && err.message) {
							const statusCode =
								typeof err.statusCode === 'number' ? err.statusCode : undefined;
							return {
								type: err.type,
								message: err.message,
								statusCode,
								detail: err.detail,
								error: err.error,
								...(statusCode === undefined || statusCode >= 500
									? { stack: getTrimmedStack(err.stack) }
									: {}),
							};
						}

						const statusCode = err.response?.statusCode;

						return {
							type: err.constructor?.name,
							message: err.message,
							statusCode,
							detail: err.response?.detail ?? err.response?.message,
							error: err.response?.error,
							...(statusCode === undefined || statusCode >= 500
								? { stack: getTrimmedStack(err.stack) }
								: {}),
						};
					},
					req(req) {
						return {
							id: req.id,
							method: req.method,
							url: req.url,
							remoteAddress: req.remoteAddress,
						};
					},
				},
				customProps: (req: any) => {
					const user = req.user as
						| { sub?: string; tenantId?: string }
						| undefined;
					return {
						correlationId: req.id,
						...(user?.tenantId && { tenantId: user.tenantId }),
						...(user?.sub && { userId: user.sub }),
					};
				},
			},
		}),
	],
	controllers: [AppController],
	providers: [
		AppService,
		GlobalThrottlerGuard,
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionFilter,
		},
		{
			provide: APP_FILTER,
			inject: [HttpAdapterHost],
			useFactory: ({ httpAdapter }: HttpAdapterHost) =>
				new SentryGlobalFilter(httpAdapter),
		},
		{
			provide: APP_GUARD,
			useClass: JwtAuthGuard,
		},
		{
			provide: APP_GUARD,
			useExisting: GlobalThrottlerGuard,
		},
	],
})
export class AppModule {}
