import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateInterestDto {
	@IsString()
	@MinLength(2)
	name!: string;

	@IsString()
	@MinLength(10)
	@MaxLength(15)
	phone!: string;

	@IsString()
	@MinLength(2)
	city!: string;
}
