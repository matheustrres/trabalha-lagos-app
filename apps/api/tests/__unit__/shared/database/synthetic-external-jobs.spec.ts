import { LAGOS_CITIES } from '@/common/constants/cities';

import {
	buildSyntheticExternalJobs,
	SYNTHETIC_EXTERNAL_JOB_SOURCE,
} from '@/shared/modules/database/seeds/synthetic-external-jobs';

describe('buildSyntheticExternalJobs', () => {
	const now = new Date('2026-09-21T12:00:00.000Z');
	const jobs = buildSyntheticExternalJobs(now);

	it('creates two synthetic jobs for each supported city', () => {
		expect(jobs).toHaveLength(LAGOS_CITIES.length * 2);

		for (const city of LAGOS_CITIES) {
			expect(jobs.filter((job) => job.city === city.slug)).toHaveLength(2);
		}
	});

	it('uses unique, explicit synthetic identifiers and non-resolving URLs', () => {
		const identifiers = jobs.map((job) => job.externalId);

		expect(new Set(identifiers).size).toBe(jobs.length);
		expect(jobs).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ source: SYNTHETIC_EXTERNAL_JOB_SOURCE }),
			]),
		);
		expect(
			jobs.every((job) => job.redirectUrl.includes('example.invalid')),
		).toBe(true);
	});

	it('stores PostGIS coordinates in longitude-latitude order', () => {
		for (const city of LAGOS_CITIES) {
			const cityJobs = jobs.filter((job) => job.city === city.slug);
			expect(cityJobs.every((job) => job.location?.x === city.lng)).toBe(true);
			expect(cityJobs.every((job) => job.location?.y === city.lat)).toBe(true);
		}
	});

	it('marks every record as active, synthetic and explicitly fictitious', () => {
		expect(
			jobs.every(
				(job) =>
					job.status === 'ACTIVE' &&
					job.source === SYNTHETIC_EXTERNAL_JOB_SOURCE &&
					job.descriptionSnippet.includes('Vaga fictícia'),
			),
		).toBe(true);
	});
});
