import { ApiProperty } from '@nestjs/swagger';

import {
	ExternalJobResponseDto,
	InternalJobSearchResponseDto,
} from './job-response.dto';

class SearchJobsMetaDto {
	@ApiProperty({ example: 42 })
	total!: number;

	@ApiProperty({ example: 1 })
	page!: number;

	@ApiProperty({ example: 20 })
	limit!: number;
}

export class SearchJobsResponseDto {
	@ApiProperty({
		type: 'array',
		items: {
			oneOf: [
				{ $ref: '#/components/schemas/InternalJobSearchResponseDto' },
				{ $ref: '#/components/schemas/ExternalJobResponseDto' },
			],
			discriminator: { propertyName: 'sourceType' },
		},
	})
	data!: Array<InternalJobSearchResponseDto | ExternalJobResponseDto>;

	@ApiProperty({ type: () => SearchJobsMetaDto })
	meta!: SearchJobsMetaDto;
}
