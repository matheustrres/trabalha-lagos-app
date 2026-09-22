import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
	@ApiProperty({ example: '018f4e6e-7b3a-7000-8000-000000000000' })
	id!: string;

	@ApiProperty({ example: 'João Silva' })
	name!: string;

	@ApiProperty({ example: '21999999999', nullable: true })
	phone!: string | null;

	@ApiProperty({ example: 'joao@email.com' })
	email!: string;

	@ApiProperty({ example: 'Cabo Frio' })
	city?: string | null;

	@ApiProperty({ enum: ['CANDIDATE', 'EMPLOYER', 'ADMIN'] })
	role!: string;

	@ApiProperty()
	createdAt!: Date;
}
