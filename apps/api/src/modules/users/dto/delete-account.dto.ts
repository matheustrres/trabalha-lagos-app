import { ApiProperty } from '@nestjs/swagger';
import { Equals, IsNotEmpty, IsString } from 'class-validator';

export class DeleteAccountDto {
	@ApiProperty()
	@IsString()
	@IsNotEmpty()
	currentPassword!: string;

	@ApiProperty({ example: 'EXCLUIR MINHA CONTA' })
	@IsString()
	@Equals('EXCLUIR MINHA CONTA')
	confirmation!: string;
}
