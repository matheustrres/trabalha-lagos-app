import { describe, expect, it } from 'vitest';

import { getUserTracker } from '@/shared/utils/get-user-tracker';

describe(getUserTracker.name, () => {
	it('prioritizes userId from authenticated payload', () => {
		const tracker = getUserTracker({
			user: { userId: 'user-123', sub: 'jwt-sub' },
			ip: '127.0.0.1',
		});

		expect(tracker).toBe('user-123');
	});

	it('falls back to sub when userId is missing', () => {
		const tracker = getUserTracker({
			user: { sub: 'jwt-sub' },
			ip: '127.0.0.1',
		});

		expect(tracker).toBe('jwt-sub');
	});

	it('falls back to IP and then unknown', () => {
		expect(getUserTracker({ ip: '127.0.0.1' })).toBe('127.0.0.1');
		expect(getUserTracker({})).toBe('unknown');
	});
});
