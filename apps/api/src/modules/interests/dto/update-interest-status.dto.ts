import { IsEnum } from 'class-validator';

export class UpdateInterestStatusDto {
	@IsEnum(['VIEWED', 'CONTACTED', 'REJECTED'], {
		message: 'status deve ser VIEWED, CONTACTED ou REJECTED',
	})
	status!: 'VIEWED' | 'CONTACTED' | 'REJECTED';
}
