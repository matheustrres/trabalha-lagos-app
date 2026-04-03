import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { candidateAvailabilityEnum } from '@/shared/modules/database/schema';

export class InterestResponseDto {
	@ApiProperty({ example: '019682b6-7b4a-7000-8000-000000000010' })
	id!: string;

	@ApiProperty({ example: 'João Silva' })
	candidateName!: string;

	@ApiProperty({ example: 'São Pedro da Aldeia' })
	candidateCity!: string;

	@ApiPropertyOptional({
		example: '22999990000',
		nullable: true,
		description: 'null para plano FREE',
	})
	candidatePhone!: string | null;

	@ApiProperty({ enum: ['COMPLETE', 'BASIC'], example: 'COMPLETE' })
	profileBadge!: 'COMPLETE' | 'BASIC';

	@ApiPropertyOptional({
		type: [String],
		example: ['turismo-hospitalidade', 'comercio-varejo'],
		nullable: true,
	})
	candidateInterests!: string[] | null;

	@ApiPropertyOptional({
		example: '3 anos como garçom em Búzios e Cabo Frio',
		nullable: true,
	})
	candidateExperience!: string | null;

	@ApiPropertyOptional({
		enum: candidateAvailabilityEnum.enumValues,
		example: 'IMMEDIATE',
		nullable: true,
	})
	candidateAvailability!:
		| (typeof candidateAvailabilityEnum.enumValues)[number]
		| null;

	@ApiPropertyOptional({
		type: [String],
		example: ['CLT', 'TEMPORARY'],
		nullable: true,
	})
	candidateAcceptedContractTypes!: string[] | null;

	@ApiPropertyOptional({
		example: 'Centro de São Pedro da Aldeia',
		nullable: true,
	})
	candidateNeighborhood!: string | null;

	@ApiProperty({ example: '019682b6-7b4a-7000-8000-000000000002' })
	jobId!: string;

	@ApiProperty({ example: 'Garçom' })
	jobTitle!: string;

	@ApiProperty({ example: 'garcom-cabo-frio-019682b6-7b4a' })
	jobSlug!: string;

	@ApiProperty({ example: 'SENT' })
	status!: string;

	@ApiProperty()
	createdAt!: Date;
}

export class InterestsMetaDto {
	@ApiProperty({ example: 12 })
	total!: number;

	@ApiProperty({ example: 'FREE' })
	plan!: string;

	@ApiProperty({
		example: true,
		description: 'true quando o plano não revela o telefone do candidato',
	})
	phoneRestricted!: boolean;
}

export class InterestsListResponseDto {
	@ApiProperty({ type: () => [InterestResponseDto] })
	data!: InterestResponseDto[];

	@ApiProperty({ type: () => InterestsMetaDto })
	meta!: InterestsMetaDto;
}
