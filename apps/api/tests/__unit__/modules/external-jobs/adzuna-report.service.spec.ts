import { LAGOS_CITIES } from '@/common/constants/cities';

import { AdzunaReportService } from '@/modules/external-jobs/integrations/adzuna/adzuna-report.service';
import type { AdzunaService } from '@/modules/external-jobs/integrations/adzuna/adzuna.service';
import {
	AdzunaIntegrationError,
	type AdzunaJob,
} from '@/modules/external-jobs/integrations/adzuna/adzuna.types';

function job(externalId: string, title = 'Atendente'): AdzunaJob {
	return {
		externalId,
		source: 'ADZUNA',
		title,
		company: 'Empresa Ágil',
		redirectUrl: 'https://example.test/private?adref=x',
		locationText: 'Cabo Frio',
		locationArea: ['RJ', 'Cabo Frio'],
		coordinates: { latitude: -22.8789, longitude: -42.0187 },
		publishedAt: '2026-09-19T12:00:00Z',
		nearestCity: 'Cabo Frio',
		nearestCitySlug: 'cabo-frio',
		distanceKm: 0,
		geoClassification: 'VALID',
		isOutsideRegion: false,
		locationDiverges: false,
		salaryIsPredicted: false,
	};
}

const defaults = {
	cities: LAGOS_CITIES,
	page: 1,
	distanceKm: 25,
	resultsPerCity: 20,
	maxDaysOld: 30,
	sortBy: 'date' as const,
	country: 'br' as const,
};

describe('AdzunaReportService', () => {
	it('consulta as sete cidades sem ultrapassar sete chamadas', async () => {
		const search = vi.fn().mockResolvedValue({ count: 0, jobs: [] });
		const service = new AdzunaReportService({
			search,
			ensureConfigured: vi.fn(),
		} as unknown as AdzunaService);
		const result = await service.run(defaults);

		expect(search).toHaveBeenCalledTimes(7);
		expect(result.exitCode).toBe(0);
		expect(result.report.requests).toMatchObject({
			attempted: 7,
			completed: 7,
			failed: 0,
		});
	});

	it('consulta somente uma cidade quando configurado', async () => {
		const search = vi.fn().mockResolvedValue({ count: 0, jobs: [] });
		const service = new AdzunaReportService({
			search,
			ensureConfigured: vi.fn(),
		} as unknown as AdzunaService);
		await service.run({ ...defaults, cities: [LAGOS_CITIES[0]] });
		expect(search).toHaveBeenCalledTimes(1);
	});

	it('consolida IDs exatos e só reporta duplicatas heurísticas', async () => {
		const search = vi
			.fn()
			.mockResolvedValueOnce({ count: 2, jobs: [job('1'), job('2')] })
			.mockResolvedValueOnce({
				count: 2,
				jobs: [job('1'), job('3', 'ATENDENTE')],
			});
		const service = new AdzunaReportService({
			search,
			ensureConfigured: vi.fn(),
		} as unknown as AdzunaService);
		const result = await service.run({
			...defaults,
			cities: LAGOS_CITIES.slice(0, 2),
		});

		expect(result.report.totals).toEqual({ raw: 4, unique: 3 });
		expect(result.report.exactDuplicates).toEqual([
			{ externalId: '1', occurrences: 2 },
		]);
		expect(result.report.possibleDuplicates).toEqual([
			expect.objectContaining({ externalIds: ['1', '2', '3'] }),
		]);
		expect(JSON.stringify(result.report)).not.toContain('adref');
	});

	it('gera relatório parcial e código 1 quando uma cidade falha', async () => {
		const search = vi
			.fn()
			.mockResolvedValueOnce({ count: 1, jobs: [job('1')] })
			.mockRejectedValueOnce(
				new AdzunaIntegrationError('RATE_LIMITED', 'Cota atingida.'),
			);
		const service = new AdzunaReportService({
			search,
			ensureConfigured: vi.fn(),
		} as unknown as AdzunaService);
		const result = await service.run({
			...defaults,
			cities: LAGOS_CITIES.slice(0, 2),
		});

		expect(result.exitCode).toBe(1);
		expect(result.report.totals).toEqual({ raw: 1, unique: 1 });
		expect(result.report.requests).toMatchObject({
			attempted: 2,
			completed: 1,
			failed: 1,
		});
	});
});
