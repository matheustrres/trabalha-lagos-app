import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
	@ApiProperty({ example: 1 })
	id!: number;

	@ApiProperty({ example: 'Turismo e Hospitalidade' })
	name!: string;

	@ApiProperty({ example: 'turismo-e-hospitalidade' })
	slug!: string;

	@ApiProperty({ example: '🏨' })
	icon!: string;

	@ApiProperty({ example: 2 })
	order!: number;

	@ApiProperty({ example: 42 })
	jobCount!: number;
}
