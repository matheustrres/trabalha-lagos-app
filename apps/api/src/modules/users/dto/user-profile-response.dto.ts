import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { candidateAvailabilityEnum } from '@/shared/modules/database/schema';

export class UserProfileResponseDto {
	@ApiProperty({ example: '018f4e6e-7b3a-7000-8000-000000000000' })
	id!: string;

	@ApiProperty({ example: 'João Silva' })
	name!: string;

	@ApiPropertyOptional({ example: '21999999999', nullable: true })
	phone!: string | null;

	@ApiPropertyOptional({ example: 'Cabo Frio' })
	city!: string | null;

	@ApiPropertyOptional({
		type: [String],
		example: ['turismo-hospitalidade', 'comercio-varejo'],
	})
	interests!: string[] | null;

	@ApiPropertyOptional({
		example: '3 anos como garçom em Búzios e Cabo Frio',
	})
	experience!: string | null;

	@ApiPropertyOptional({
		enum: candidateAvailabilityEnum.enumValues,
		example: 'IMMEDIATE',
	})
	availability!: (typeof candidateAvailabilityEnum.enumValues)[number] | null;

	@ApiPropertyOptional({
		type: [String],
		example: ['CLT', 'TEMPORARY'],
	})
	acceptedContractTypes!: string[] | null;

	@ApiPropertyOptional({ example: 'Centro de São Pedro da Aldeia' })
	neighborhood!: string | null;
}
