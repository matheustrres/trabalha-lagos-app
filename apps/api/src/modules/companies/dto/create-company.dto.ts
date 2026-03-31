import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

import { IsValidCNPJ, IsValidPhoneBR } from '@/shared/decorators';

export class CreateCompanyDto {
	@ApiProperty({ example: 'Restaurante Beira Mar' })
	@IsString()
	@IsNotEmpty()
	name!: string;

	@ApiProperty({ example: 'Cabo Frio' })
	@IsString()
	@IsNotEmpty()
	city!: string;

	@ApiProperty({ example: '22999999999' })
	@IsString()
	@IsNotEmpty()
	@IsValidPhoneBR()
	whatsapp!: string;

	@ApiProperty({ example: '12345678000100' })
	@IsString()
	@IsNotEmpty()
	@IsValidCNPJ()
	document!: string;
}
