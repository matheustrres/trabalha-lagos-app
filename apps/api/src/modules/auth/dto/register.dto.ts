import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsEmail,
	IsEnum,
	IsNotEmpty,
	IsStrongPassword,
	IsString,
	MaxLength,
	MinLength,
	ValidateIf,
} from 'class-validator';

import {
	IsValidCNPJ,
	IsValidPhoneBR,
} from '@/common/decorators/validation.decorators';

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

	@ApiProperty({ example: 'joao@email.com' })
	@IsString()
	@IsNotEmpty()
	@IsEmail()
	email!: string;

	@ApiProperty({ example: 'Senha@123', minLength: 8 })
	@IsString()
	@IsNotEmpty()
	@IsStrongPassword(
		{
			minLength: 8,
			minLowercase: 1,
			minUppercase: 1,
			minNumbers: 1,
			minSymbols: 1,
		},
		{
			message:
				'A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, letra minúscula, número e símbolo.',
		},
	)
	password!: string;

	@ApiProperty({ example: 'Cabo Frio' })
	@IsString()
	@IsNotEmpty()
	city!: string;

	@ApiProperty({ enum: ['CANDIDATE', 'EMPLOYER'] })
	@IsEnum(['CANDIDATE', 'EMPLOYER'])
	role!: 'CANDIDATE' | 'EMPLOYER';

	@ApiPropertyOptional({
		example: '12345678000100',
		description: 'CNPJ para empregadores (obrigatório se role=EMPLOYER)',
	})
	@ValidateIf((o: RegisterDto) => o.role === 'EMPLOYER')
	@IsString()
	@IsNotEmpty()
	@IsValidCNPJ()
	document!: string;
}
