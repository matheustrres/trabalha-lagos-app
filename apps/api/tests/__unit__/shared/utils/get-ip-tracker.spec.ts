import { describe, expect, it } from 'vitest';

import { getIpTracker } from '@/shared/utils/get-ip-tracker';

describe(getIpTracker.name, () => {
	it('returns the first IP from x-forwarded-for', () => {
		const tracker = getIpTracker({
			headers: {
				'x-forwarded-for': '203.0.113.10, 198.51.100.99',
			},
			ip: '127.0.0.1',
		});

		expect(tracker).toBe('203.0.113.10');
	});

	it('falls back to req.ip when x-forwarded-for is missing', () => {
		const tracker = getIpTracker({ ip: '127.0.0.1' });

		expect(tracker).toBe('127.0.0.1');
	});

	it('returns unknown when no address is available', () => {
		const tracker = getIpTracker({});

		expect(tracker).toBe('unknown');
	});
});
