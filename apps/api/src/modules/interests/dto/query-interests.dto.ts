import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { candidateAvailabilityEnum } from '@/shared/modules/database/schema';

export class QueryInterestsDto {
	@IsOptional()
	@IsEnum(['SENT', 'VIEWED', 'CONTACTED', 'REJECTED'], {
		message: 'status deve ser SENT, VIEWED, CONTACTED ou REJECTED',
	})
	status?: 'SENT' | 'VIEWED' | 'CONTACTED' | 'REJECTED';

	@IsOptional()
	@IsUUID('all', { message: 'jobId deve ser um UUID válido' })
	jobId?: string;

	@IsOptional()
	@IsEnum(candidateAvailabilityEnum.enumValues, {
		message:
			'availability deve ser IMMEDIATE, IN_15_DAYS, IN_30_DAYS ou NEGOTIABLE',
	})
	availability?: (typeof candidateAvailabilityEnum.enumValues)[number];

	@IsOptional()
	@IsString()
	area?: string;
}
