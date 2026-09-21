import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompanyInJobDto {
	@ApiProperty({ example: '019682b6-7b4a-7000-8000-000000000001' })
	id!: string;

	@ApiProperty({ example: 'Restaurante Beira Mar' })
	name!: string;

	@ApiPropertyOptional({
		example: 'https://cdn.example.com/logo.png',
		nullable: true,
	})
	logoUrl!: string | null;

	@ApiProperty({ example: false })
	verified!: boolean;

	@ApiProperty({ example: 'FREE' })
	plan!: string;
}

export class CategoryInJobDto {
	@ApiProperty({ example: 1 })
	id!: number;

	@ApiProperty({ example: 'Turismo e Hospitalidade' })
	name!: string;

	@ApiProperty({ example: 'turismo-e-hospitalidade' })
	slug!: string;

	@ApiProperty({ example: '🏨' })
	icon!: string;
}

export class JobResponseDto {
	@ApiProperty({ example: '019682b6-7b4a-7000-8000-000000000002' })
	id!: string;

	@ApiProperty({ example: 'Atendente de Turismo em Cabo Frio' })
	title!: string;

	@ApiProperty({ example: 'atendente-de-turismo-cabo-frio-x4k2' })
	slug!: string;

	@ApiProperty({ example: 'Descrição detalhada da vaga...' })
	description!: string;

	@ApiProperty({ example: 'CLT' })
	contractType!: string;

	@ApiProperty({ example: 'Cabo Frio' })
	city!: string;

	@ApiPropertyOptional({ example: 'Rua das Flores, 123', nullable: true })
	address!: string | null;

	@ApiPropertyOptional({ example: 200000, nullable: true })
	salaryMin!: number | null;

	@ApiPropertyOptional({ example: 300000, nullable: true })
	salaryMax!: number | null;

	@ApiProperty({ example: false })
	salaryHidden!: boolean;

	@ApiPropertyOptional({ example: '22999999999', nullable: true })
	whatsappContact!: string | null;

	@ApiProperty({ example: 'WHATSAPP' })
	contactMethod!: string;

	@ApiProperty({ example: 'ACTIVE' })
	status!: string;

	@ApiProperty({ example: false })
	featured!: boolean;

	@ApiProperty({ example: false })
	urgent!: boolean;

	@ApiProperty()
	expiresAt!: Date;

	@ApiProperty({ example: 0 })
	viewCount!: number;

	@ApiProperty({ example: 0 })
	interestCount!: number;

	@ApiProperty()
	createdAt!: Date;

	@ApiPropertyOptional({
		example: 2.4,
		nullable: true,
		description: 'Distância em km (null se sem coords)',
	})
	distanceKm!: number | null;

	@ApiProperty({ type: () => CompanyInJobDto })
	company!: CompanyInJobDto;

	@ApiProperty({ type: () => CategoryInJobDto })
	category!: CategoryInJobDto;
}

export class InternalJobSearchResponseDto extends JobResponseDto {
	@ApiProperty({ enum: ['INTERNAL'], example: 'INTERNAL' })
	sourceType!: 'INTERNAL';
}

export class ExternalJobResponseDto {
	@ApiProperty({ enum: ['EXTERNAL'], example: 'EXTERNAL' })
	sourceType!: 'EXTERNAL';

	@ApiProperty()
	id!: string;

	@ApiProperty({ example: 'SYNTHETIC' })
	externalSource!: string;

	@ApiProperty()
	title!: string;

	@ApiProperty()
	description!: string;

	@ApiProperty()
	companyName!: string;

	@ApiPropertyOptional({ nullable: true })
	redirectUrl!: string | null;

	@ApiPropertyOptional({ nullable: true })
	categoryName!: string | null;

	@ApiPropertyOptional({ nullable: true })
	contractType!: string | null;

	@ApiPropertyOptional({ nullable: true })
	salaryMin!: number | null;

	@ApiPropertyOptional({ nullable: true })
	salaryMax!: number | null;

	@ApiProperty()
	salaryPredicted!: boolean;

	@ApiProperty()
	locationText!: string;

	@ApiProperty()
	city!: string;

	@ApiPropertyOptional({ nullable: true })
	distanceKm!: number | null;

	@ApiProperty()
	publishedAt!: Date;

	@ApiPropertyOptional({ nullable: true })
	expiresAt!: Date | null;
}
