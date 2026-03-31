import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateJobStatusDto {
	@ApiProperty({ enum: ['ACTIVE', 'PAUSED', 'CLOSED'], example: 'PAUSED' })
	@IsEnum(['ACTIVE', 'PAUSED', 'CLOSED'])
	status!: 'ACTIVE' | 'PAUSED' | 'CLOSED';
}
