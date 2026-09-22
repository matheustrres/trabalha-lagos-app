import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class UpdatePasswordDto {
	@ApiProperty({ example: 'Senha@atual1' })
	@IsString()
	@IsNotEmpty()
	currentPassword!: string;

	@ApiProperty({ example: 'Senha@nova2', minLength: 8 })
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
	newPassword!: string;
}
