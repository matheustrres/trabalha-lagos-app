import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

import { IsValidCNPJ, IsValidPhoneBR } from '@/shared/decorators';

export class RegisterDto {
	@ApiProperty({ example: 'João Silva' })
	@IsString()
	@IsNotEmpty()
	@MinLength(2)
	name!: string;

	@ApiProperty({ example: '21999999999', minLength: 10, maxLength: 15 })
	@IsString()
	@IsNotEmpty()
	@MinLength(10)
	@MaxLength(15)
	@IsValidPhoneBR()
	phone!: string;

	@ApiPropertyOptional({ example: 'joao@email.com' })
	@IsEmail()
	@IsOptional()
	email?: string;

	@ApiProperty({ example: 'senha123', minLength: 6 })
	@IsString()
	@IsNotEmpty()
	@MinLength(6)
	password!: string;

	@ApiProperty({ example: 'Cabo Frio' })
	@IsString()
	@IsNotEmpty()
	city!: string;

	@ApiProperty({ enum: ['CANDIDATE', 'EMPLOYER'] })
	@IsEnum(['CANDIDATE', 'EMPLOYER'])
	role!: 'CANDIDATE' | 'EMPLOYER';

	@ApiProperty({
		example: '12345678000100',
		description: 'CNPJ para empregadores (obrigatório)',
	})
	@IsString()
	@IsNotEmpty()
	@IsValidCNPJ()
	document!: string;
}
