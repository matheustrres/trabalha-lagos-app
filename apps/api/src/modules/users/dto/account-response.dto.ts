import { ApiProperty } from '@nestjs/swagger';

export class AccountResponseDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	name!: string;

	@ApiProperty()
	email!: string;

	@ApiProperty({ nullable: true })
	city!: string | null;

	@ApiProperty({ enum: ['CANDIDATE', 'EMPLOYER', 'ADMIN'] })
	role!: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
}
