import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

	@ApiProperty({ example: '019682b6-7b4a-7000-8000-000000000002' })
	jobId!: string;

	@ApiProperty({ example: 'Garçom' })
	jobTitle!: string;

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
