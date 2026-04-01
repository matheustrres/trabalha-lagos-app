import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	MaxLength,
	Min,
	MinLength,
} from 'class-validator';

import { IsValidPhoneBR } from '@/common/decorators/validation.decorators';

export enum ContractType {
	CLT = 'CLT',
	PJ = 'PJ',
	FREELANCER = 'FREELANCER',
	TEMPORARY = 'TEMPORARY',
	INTERNSHIP = 'INTERNSHIP',
	OTHER = 'OTHER',
}

export enum ContactMethod {
	WHATSAPP = 'WHATSAPP',
	PLATFORM = 'PLATFORM',
	BOTH = 'BOTH',
}

export class CreateJobDto {
	@ApiProperty({ example: 'Atendente de Turismo' })
	@IsString()
	@IsNotEmpty()
	@MinLength(3)
	@MaxLength(120)
	title!: string;

	@ApiProperty({
		example: 'Descrição detalhada da vaga com requisitos e benefícios...',
	})
	@IsString()
	@IsNotEmpty()
	@MinLength(20)
	@MaxLength(5000)
	description!: string;

	@ApiProperty({ example: 1 })
	@IsInt()
	@Min(1)
	@Type(() => Number)
	categoryId!: number;

	@ApiProperty({ enum: ContractType, example: ContractType.CLT })
	@IsEnum(ContractType)
	contractType!: ContractType;

	@ApiProperty({ example: 'Cabo Frio' })
	@IsString()
	@IsNotEmpty()
	city!: string;

	@ApiPropertyOptional({ example: 'Rua das Flores, 123' })
	@IsString()
	@IsOptional()
	address?: string;

	@ApiProperty({ example: -42.0187, description: 'Longitude' })
	@IsNumber()
	@Min(-180)
	@Max(180)
	locationLng!: number;

	@ApiProperty({ example: -22.8789, description: 'Latitude' })
	@IsNumber()
	@Min(-90)
	@Max(90)
	locationLat!: number;

	@ApiPropertyOptional({
		example: 200000,
		description: 'Salário mínimo em centavos',
	})
	@IsInt()
	@Min(0)
	@IsOptional()
	@Type(() => Number)
	salaryMin?: number;

	@ApiPropertyOptional({
		example: 300000,
		description: 'Salário máximo em centavos',
	})
	@IsInt()
	@Min(0)
	@IsOptional()
	@Type(() => Number)
	salaryMax?: number;

	@ApiPropertyOptional({ example: false })
	@IsBoolean()
	@IsOptional()
	salaryHidden?: boolean;

	@ApiProperty({ example: '22999999999' })
	@IsString()
	@MinLength(10)
	@MaxLength(15)
	@IsValidPhoneBR()
	whatsappContact!: string;

	@ApiPropertyOptional({ enum: ContactMethod, example: ContactMethod.WHATSAPP })
	@IsEnum(ContactMethod)
	@IsOptional()
	contactMethod?: ContactMethod;

	@ApiPropertyOptional({
		type: [String],
		example: ['Experiência em atendimento ao cliente'],
	})
	@IsArray()
	@IsString({ each: true })
	@IsOptional()
	requirements?: string[];

	@ApiPropertyOptional({ example: false, description: 'Apenas plano SEASON' })
	@IsBoolean()
	@IsOptional()
	featured?: boolean;

	@ApiPropertyOptional({ example: false, description: 'Apenas plano SEASON' })
	@IsBoolean()
	@IsOptional()
	urgent?: boolean;
}
