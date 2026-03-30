import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateCompanyDto {
	@ApiPropertyOptional({ example: 'Restaurante Beira Mar' })
	@IsString()
	@IsOptional()
	name?: string;

	@ApiPropertyOptional({ example: '12.345.678/0001-99' })
	@IsString()
	@IsOptional()
	document?: string;

	@ApiPropertyOptional({ example: 'Gastronomia' })
	@IsString()
	@IsOptional()
	segment?: string;

	@ApiPropertyOptional({ example: '22999999999' })
	@IsString()
	@IsOptional()
	@MaxLength(15)
	whatsapp?: string;

	@ApiPropertyOptional({ example: 'https://example.com/logo.png' })
	@IsString()
	@IsOptional()
	@Matches(/^https?:\/\/.+/, { message: 'logoUrl deve ser uma URL válida.' })
	logoUrl?: string;
}
