import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

import {
	IsValidCNPJ,
	IsValidPhoneBR,
} from '@/common/decorators/validation.decorators';

export class CreateCompanyDto {
	@ApiProperty({ example: 'Restaurante Beira Mar' })
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiProperty({ example: 'Cabo Frio' })
	@IsString()
	@IsNotEmpty()
	city!: string;

	@ApiPropertyOptional({ example: '22999999999' })
	@IsOptional()
	@IsString()
	@IsValidPhoneBR()
	whatsapp?: string;

	@ApiProperty({ example: '12345678000100' })
	@IsString()
	@IsNotEmpty()
	@IsValidCNPJ()
	document!: string;

	@ApiPropertyOptional({ example: 'RESTAURANT' })
	@IsOptional()
	@IsString()
	segment?: string;
}
