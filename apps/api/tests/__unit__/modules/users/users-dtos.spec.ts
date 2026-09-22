import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { UpdateUserProfileDto } from '@/modules/users/dto/update-user-profile.dto';
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

describe(UpdateUserProfileDto.name, () => {
	it('accepts a valid candidate WhatsApp', async () => {
		const dto = plainToInstance(UpdateUserProfileDto, {
			phone: '22988887777',
		});

		await expect(validate(dto)).resolves.toHaveLength(0);
	});

	it('accepts null to remove the candidate WhatsApp', async () => {
		const dto = plainToInstance(UpdateUserProfileDto, { phone: null });

		await expect(validate(dto)).resolves.toHaveLength(0);
	});

	it('rejects an invalid candidate WhatsApp', async () => {
		const dto = plainToInstance(UpdateUserProfileDto, { phone: '12345' });

		const errors = await validate(dto);

		expect(errors).toHaveLength(1);
		expect(errors[0]?.property).toBe('phone');
	});
});
