import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsEnum,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
} from 'class-validator';

import { ContractType } from './create-job.dto';

enum SortOrder {
	DISTANCE = 'distance',
	RECENT = 'recent',
}

export class QueryJobsDto {
	@ApiPropertyOptional({
		example: -22.8789,
		description: 'Latitude do ponto central',
	})
	@IsNumber()
	@Min(-90)
	@Max(90)
	@IsOptional()
	@Type(() => Number)
	lat?: number;

	@ApiPropertyOptional({
		example: -42.0187,
		description: 'Longitude do ponto central',
	})
	@IsNumber()
	@Min(-180)
	@Max(180)
	@IsOptional()
	@Type(() => Number)
	lng?: number;

	@ApiPropertyOptional({ example: 20, default: 20, description: 'Raio em km' })
	@IsNumber()
	@Min(1)
	@Max(100)
	@IsOptional()
	@Type(() => Number)
	radius: number = 20;

	@ApiPropertyOptional({
		example: 'turismo-e-hospitalidade',
		description: 'Slug da categoria',
	})
	@IsString()
	@IsOptional()
	category?: string;

	@ApiPropertyOptional({ enum: ContractType })
	@IsEnum(ContractType)
	@IsOptional()
	contractType?: ContractType;

	@ApiPropertyOptional({ example: 'Cabo Frio' })
	@IsString()
	@IsOptional()
	city?: string;

	@ApiPropertyOptional({
		example: 'garçom',
		description: 'Busca textual no título',
	})
	@IsString()
	@IsOptional()
	q?: string;

	@ApiPropertyOptional({ example: 1, default: 1 })
	@IsInt()
	@Min(1)
	@IsOptional()
	@Type(() => Number)
	page: number = 1;

	@ApiPropertyOptional({ example: 20, default: 20 })
	@IsInt()
	@Min(1)
	@Max(50)
	@IsOptional()
	@Type(() => Number)
	limit: number = 20;

	@ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DISTANCE })
	@IsEnum(SortOrder)
	@IsOptional()
	sort: SortOrder = SortOrder.DISTANCE;
}
