import { mock, type MockProxy } from 'vitest-mock-extended';

import { EnvService } from '@/shared/modules/env/env.service';

type JwtEnvKey =
	| 'JWT_SECRET'
	| 'JWT_EXPIRES_IN'
	| 'JWT_REFRESH_SECRET'
	| 'JWT_REFRESH_EXPIRES_IN';

const defaultEnvMap: Record<JwtEnvKey, string> = {
	JWT_SECRET: 'test-secret',
	JWT_EXPIRES_IN: '15m',
	JWT_REFRESH_SECRET: 'test-refresh-secret',
	JWT_REFRESH_EXPIRES_IN: '7d',
};

export function makeEnvServiceStub(
	overrides: Partial<Record<JwtEnvKey, string>> = {},
): MockProxy<EnvService> {
	const map = { ...defaultEnvMap, ...overrides };
	const envService = mock<EnvService>();
	envService.getKeyOrThrow.mockImplementation(
		(key) => (map[key as JwtEnvKey] ?? 'fallback') as never,
	);
	return envService;
}
