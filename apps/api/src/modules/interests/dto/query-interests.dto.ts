import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class QueryInterestsDto {
	@IsOptional()
	@IsEnum(['SENT', 'VIEWED', 'CONTACTED', 'REJECTED'], {
		message: 'status deve ser SENT, VIEWED, CONTACTED ou REJECTED',
	})
	status?: 'SENT' | 'VIEWED' | 'CONTACTED' | 'REJECTED';

	@IsOptional()
	@IsUUID('all', { message: 'jobId deve ser um UUID válido' })
	jobId?: string;
}
