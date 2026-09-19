import { Transform } from 'class-transformer';
import {
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
} from 'class-validator';

import { ENodeEnv } from '@/@core/enums/node-env';

export class EnvSchema {
	@IsEnum(ENodeEnv)
	@IsNotEmpty()
	NODE_ENV: ENodeEnv = ENodeEnv.Development;

	@IsNumber()
	@IsNotEmpty()
	@Transform(({ value }) => parseInt(value))
	PORT!: number;

	@IsString()
	@IsNotEmpty()
	PG_USER!: string;

	@IsString()
	@IsNotEmpty()
	PG_PASSWORD!: string;

	@IsString()
	@IsNotEmpty()
	PG_HOST = 'localhost';

	@IsNumber()
	@IsNotEmpty()
	@Transform(({ value }) => parseInt(value))
	PG_PORT = 5432;

	@IsString()
	@IsNotEmpty()
	PG_DATABASE!: string;

	@IsString()
	@IsNotEmpty()
	DATABASE_URL!: string;

	@IsString()
	@IsNotEmpty()
	JWT_SECRET!: string;

	@IsString()
	@IsNotEmpty()
	JWT_EXPIRES_IN = '15m';

	@IsString()
	@IsNotEmpty()
	JWT_REFRESH_SECRET!: string;

	@IsString()
	@IsNotEmpty()
	JWT_REFRESH_EXPIRES_IN = '7d';

	@IsString()
	@IsNotEmpty()
	CORS_ORIGINS!: string;

	@IsString()
	@IsNotEmpty()
	REDIS_HOST!: string;

	@IsNumber()
	@IsNotEmpty()
	@Transform(({ value }) => parseInt(value))
	REDIS_PORT!: number;

	@IsString()
	@IsOptional()
	REDIS_PASSWORD?: string;

	@IsString()
	@IsOptional()
	VIEW_COUNTER_FLUSH_CRON?: string;

	@IsString()
	@IsOptional()
	SENTRY_DSN?: string;

	@IsString()
	@IsOptional()
	ADZUNA_APP_ID?: string;

	@IsString()
	@IsOptional()
	ADZUNA_APP_KEY?: string;

	@IsBoolean()
	@IsOptional()
	@Transform(({ value }) => {
		if (typeof value === 'boolean') return value;
		if (typeof value === 'string') {
			return !['false', '0', 'off', 'no'].includes(value.toLowerCase());
		}
		return true;
	})
	THROTTLE_ENABLED = true;
}
