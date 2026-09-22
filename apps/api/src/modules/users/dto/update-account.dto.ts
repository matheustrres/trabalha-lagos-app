import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
	IsIn,
	IsNotEmpty,
	IsString,
	MaxLength,
	MinLength,
} from 'class-validator';

import { LAGOS_CITIES } from '@/common/constants/cities';

export class UpdateAccountDto {
	@ApiProperty({ example: 'João Silva', minLength: 2, maxLength: 100 })
	@Transform(({ value }: { value: unknown }) =>
		typeof value === 'string' ? value.trim() : value,
	)
	@IsString()
	@IsNotEmpty()
	@MinLength(2)
	@MaxLength(100)
	name!: string;

	@ApiProperty({ enum: LAGOS_CITIES.map((city) => city.name) })
	@IsString()
	@IsIn(LAGOS_CITIES.map((city) => city.name))
	city!: string;
}
