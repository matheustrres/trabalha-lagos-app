import { ApiProperty } from '@nestjs/swagger';

import { JobResponseDto } from './job-response.dto';

class SearchJobsMetaDto {
	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;
}

export class SearchJobsResponseDto {
	@ApiProperty({ type: () => [JobResponseDto] })
	data!: JobResponseDto[];

	@ApiProperty({ type: () => SearchJobsMetaDto })
	meta!: SearchJobsMetaDto;
}
