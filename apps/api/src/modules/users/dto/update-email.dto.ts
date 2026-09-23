import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateEmailDto {
	@ApiProperty({ example: 'joao.novo@email.com' })
	@Transform(({ value }: { value: unknown }) =>
		typeof value === 'string' ? value.trim().toLowerCase() : value,
	)
	@IsString()
	@IsNotEmpty()
	@IsEmail()
	email!: string;

	@ApiProperty({ example: 'senhaAtual123!' })
	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	currentPassword!: string;
}
