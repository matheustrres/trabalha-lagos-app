import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
	@IsString()
	@IsOptional()
	whatsapp?: string;
}
