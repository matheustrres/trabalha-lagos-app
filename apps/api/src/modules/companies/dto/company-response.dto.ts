import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompanyResponseDto {
	@ApiProperty()
	id!: string;

	@ApiProperty()
	userId!: string;

	@ApiProperty()
	name!: string;

	@ApiPropertyOptional({ nullable: true })
	document!: string | null;

	@ApiProperty()
	city!: string;

	@ApiPropertyOptional({ nullable: true })
	segment!: string | null;

	@ApiPropertyOptional({ nullable: true })
	logoUrl!: string | null;

	@ApiPropertyOptional({ nullable: true })
	whatsapp!: string | null;

	@ApiProperty({ enum: ['FREE', 'PRO', 'SEASON'] })
	plan!: string;

	@ApiPropertyOptional({ nullable: true })
	planExpiresAt!: Date | null;

	@ApiProperty()
	verified!: boolean;

	@ApiProperty()
	createdAt!: Date;

	@ApiProperty()
	updatedAt!: Date;
}
