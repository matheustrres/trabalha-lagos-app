import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
	@ApiProperty({ example: '21999999999', minLength: 10, maxLength: 15 })
	@IsString()
	@IsNotEmpty()
	@MinLength(10)
	@MaxLength(15)
	phone!: string;

	@ApiProperty({ example: 'senha123' })
	@IsString()
	@IsNotEmpty()
	@MinLength(1)
	password!: string;
}
