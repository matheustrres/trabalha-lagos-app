import { ApiPropertyOptional } from '@nestjs/swagger';
import {
	ArrayMaxSize,
	IsArray,
	IsIn,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

import { IsValidPhoneBR } from '@/common/decorators/validation.decorators';

import { candidateAvailabilityEnum } from '@/shared/modules/database/schema';

export class UpdateUserProfileDto {
	@ApiPropertyOptional({
		example: '22999999999',
		description: 'WhatsApp pessoal opcional do candidato',
		nullable: true,
	})
	@IsOptional()
	@IsString()
	@MinLength(10)
	@MaxLength(15)
	@IsValidPhoneBR()
	phone?: string | null;

	@ApiPropertyOptional({
		type: [String],
		example: ['turismo-hospitalidade', 'comercio-varejo'],
	})
	@IsOptional()
	@IsArray()
	@ArrayMaxSize(10)
	@IsString({ each: true })
	interests?: string[];

	@ApiPropertyOptional({
		example: '3 anos como garçom em Búzios e Cabo Frio',
		maxLength: 200,
	})
	@IsOptional()
	@IsString()
	@MaxLength(200)
	experience?: string;

	@ApiPropertyOptional({
		enum: candidateAvailabilityEnum.enumValues,
		example: 'IMMEDIATE',
	})
	@IsOptional()
	@IsIn(candidateAvailabilityEnum.enumValues)
	availability?: (typeof candidateAvailabilityEnum.enumValues)[number];

	@ApiPropertyOptional({
		type: [String],
		example: ['CLT', 'TEMPORARY'],
	})
	@IsOptional()
	@IsArray()
	@ArrayMaxSize(6)
	@IsString({ each: true })
	acceptedContractTypes?: string[];

	@ApiPropertyOptional({
		example: 'Centro de São Pedro da Aldeia',
		maxLength: 100,
	})
	@IsOptional()
	@IsString()
	@MaxLength(100)
	neighborhood?: string;
}
