import { plainToInstance } from 'class-transformer';
import { describe, expect, it } from 'vitest';

import { CategoryResponseDto } from '@/modules/categories/dto/category-response.dto';

describe(CategoryResponseDto.name, () => {
	it('maps a plain payload to dto shape', () => {
		const payload = {
			id: 1,
			name: 'Turismo e Hospitalidade',
			slug: 'turismo-hospitalidade',
			icon: '🏨',
			order: 2,
			jobCount: 42,
		};

		const dto = plainToInstance(CategoryResponseDto, payload);

		expect(dto).toBeInstanceOf(CategoryResponseDto);
		expect(dto).toEqual(payload);
	});

	it('supports edge case with zero active jobs', () => {
		const payload = {
			id: 10,
			name: 'Outros',
			slug: 'outros',
			icon: '📦',
			order: 10,
			jobCount: 0,
		};

		const dto = plainToInstance(CategoryResponseDto, payload);

		expect(dto.jobCount).toBe(0);
		expect(dto.slug).toBe('outros');
	});
});
