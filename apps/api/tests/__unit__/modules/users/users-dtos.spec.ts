import { plainToInstance } from 'class-transformer';
import { describe, expect, it } from 'vitest';

import { UserResponseDto } from '@/modules/users/dto/user-response.dto';

describe(UserResponseDto.name, () => {
	it('maps payload with required email and nullable phone/city', () => {
		const payload = {
			id: 'user-uuid-1',
			name: 'João Silva',
			phone: null,
			email: 'joao@email.com',
			city: null,
			role: 'CANDIDATE',
			createdAt: new Date('2026-01-01T00:00:00.000Z'),
		};

		const dto = plainToInstance(UserResponseDto, payload);

		expect(dto).toBeInstanceOf(UserResponseDto);
		expect(dto).toEqual(payload);
	});

	it('maps payload with email and city filled', () => {
		const payload = {
			id: 'user-uuid-2',
			name: 'Ana Lima',
			phone: '22988887777',
			email: 'ana@email.com',
			city: 'Cabo Frio',
			role: 'EMPLOYER',
			createdAt: new Date('2026-01-02T00:00:00.000Z'),
		};

		const dto = plainToInstance(UserResponseDto, payload);

		expect(dto.role).toBe('EMPLOYER');
		expect(dto.email).toBe('ana@email.com');
	});
});
