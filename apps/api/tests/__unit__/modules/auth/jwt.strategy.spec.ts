import { UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { type MockProxy } from 'vitest-mock-extended';

import {
	JwtStrategy,
	type JwtPayload,
} from '@/modules/auth/strategies/jwt.strategy';

import { EnvService } from '@/shared/modules/env/env.service';

import { makeEnvServiceStub } from '#/data/stubs/env.service.stub';

describe(JwtStrategy.name, () => {
	let SUT: JwtStrategy;
	let envService: MockProxy<EnvService>;

	beforeEach(() => {
		envService = makeEnvServiceStub();
		SUT = new JwtStrategy(envService);
	});

	it('reads JWT secret from EnvService on initialization', () => {
		expect(envService.getKeyOrThrow).toHaveBeenCalledWith('JWT_SECRET');
	});

	it('returns mapped user data when payload is valid', () => {
		const payload: JwtPayload = { sub: 'user-uuid-1', role: 'EMPLOYER' };

		const result = SUT.validate(payload);

		expect(result).toEqual({ userId: 'user-uuid-1', role: 'EMPLOYER' });
	});

	it('throws UnauthorizedException when payload has no sub', () => {
		const payload = { sub: '', role: 'CANDIDATE' } as JwtPayload;

		expect(() => SUT.validate(payload)).toThrow(UnauthorizedException);
	});

	it('throws UnauthorizedException when payload has no role', () => {
		const payload = { sub: 'user-uuid-1', role: '' } as JwtPayload;

		expect(() => SUT.validate(payload)).toThrow(UnauthorizedException);
	});
});
