import { Transform } from 'class-transformer';
import {
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
	NODE_ENV?: ENodeEnv;

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	PORT = 3000;

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
	JWT_EXPIRES_IN!: string;

	@IsString()
	@IsNotEmpty()
	JWT_REFRESH_SECRET!: string;

	@IsString()
	@IsNotEmpty()
	JWT_REFRESH_EXPIRES_IN!: string;

	@IsString()
	@IsOptional()
	REDIS_HOST = 'localhost';

	@IsNumber()
	@IsOptional()
	@Transform(({ value }) => parseInt(value))
	REDIS_PORT = 6379;

	@IsString()
	@IsOptional()
	REDIS_PASSWORD?: string;

	@IsString()
	@IsOptional()
	VIEW_COUNTER_FLUSH_CRON?: string;
}
