import { HttpService } from '@nestjs/axios';
import { AxiosError, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';

import { AdzunaService } from '@/modules/external-jobs/integrations/adzuna/adzuna.service';
import { AdzunaIntegrationError } from '@/modules/external-jobs/integrations/adzuna/adzuna.types';

import type { EnvService } from '@/shared/modules/env/env.service';

const credentials = { appId: 'secret-id', appKey: 'secret-key' };

function createService(options = credentials) {
	const httpService = { get: vi.fn() };
	const envService = {
		getKey: vi.fn((key: string) =>
			key === 'ADZUNA_APP_ID' ? options.appId : options.appKey,
		),
		getKeyOrThrow: vi.fn((key: string) =>
			key === 'ADZUNA_APP_ID' ? options.appId : options.appKey,
		),
	};
	return {
		service: new AdzunaService(
			httpService as unknown as HttpService,
			envService as unknown as EnvService,
		),
		httpService,
	};
}

function validPayload(overrides: Record<string, unknown> = {}) {
	return {
		count: 1,
		results: [
			{
				id: 'job-1',
				title: 'Desenvolvedor',
				description: 'Descrição',
				redirect_url: 'https://example.test/job?adref=private',
				created: '2026-09-19T12:00:00Z',
				company: { display_name: 'Empresa' },
				category: { label: 'TI' },
				contract_type: 'permanent',
				salary_min: 3000,
				salary_max: 5000,
				salary_is_predicted: '1',
				location: { display_name: 'Cabo Frio, RJ', area: ['RJ', 'Cabo Frio'] },
				latitude: -22.8789,
				longitude: -42.0187,
				...overrides,
			},
		],
	};
}

const searchOptions = {
	city: 'Cabo Frio',
	page: 1,
	distanceKm: 25,
	resultsPerPage: 20,
	maxDaysOld: 30,
};

describe('AdzunaService', () => {
	it('monta URL e parâmetros sem incluir credenciais na URL', async () => {
		const { service, httpService } = createService();
		httpService.get.mockReturnValue(of({ data: validPayload() }));

		await service.search(searchOptions);

		expect(httpService.get).toHaveBeenCalledWith(
			'https://api.adzuna.com/v1/api/jobs/br/search/1',
			expect.objectContaining({
				params: {
					app_id: credentials.appId,
					app_key: credentials.appKey,
					where: 'Cabo Frio',
					distance: 25,
					results_per_page: 20,
					max_days_old: 30,
					sort_by: 'date',
				},
			}),
		);
		expect(httpService.get.mock.calls[0]?.[0]).not.toContain('secret');
	});

	it('falha antes da chamada quando faltam credenciais', async () => {
		const { service, httpService } = createService({ appId: '', appKey: '' });
		await expect(service.search(searchOptions)).rejects.toMatchObject({
			code: 'MISSING_CONFIGURATION',
		});
		expect(httpService.get).not.toHaveBeenCalled();
	});

	it('normaliza um payload válido sem expor o formato externo', async () => {
		const { service, httpService } = createService();
		httpService.get.mockReturnValue(of({ data: validPayload() }));

		const result = await service.search(searchOptions);

		expect(result.jobs[0]).toMatchObject({
			externalId: 'job-1',
			source: 'ADZUNA',
			title: 'Desenvolvedor',
			company: 'Empresa',
			category: 'TI',
			contractType: 'permanent',
			salaryIsPredicted: true,
			nearestCity: 'Cabo Frio',
			geoClassification: 'VALID',
		});
	});

	it('aceita campos opcionais ausentes', async () => {
		const { service, httpService } = createService();
		httpService.get.mockReturnValue(
			of({
				data: validPayload({
					description: undefined,
					company: undefined,
					category: undefined,
					location: undefined,
					latitude: undefined,
					longitude: undefined,
				}),
			}),
		);

		const job = (await service.search(searchOptions)).jobs[0];
		expect(job).toMatchObject({
			geoClassification: 'WITHOUT_COORDINATES',
			locationArea: [],
		});
	});

	it.each([
		{},
		{ results: 'invalid' },
		{ results: [{ id: 'missing-required-fields' }] },
	])('rejeita payload malformado', async (payload) => {
		const { service, httpService } = createService();
		httpService.get.mockReturnValue(of({ data: payload }));
		await expect(service.search(searchOptions)).rejects.toMatchObject({
			code: 'INVALID_RESPONSE',
		});
	});

	it.each([
		[401, 'UNAUTHORIZED'],
		[403, 'FORBIDDEN'],
		[429, 'RATE_LIMITED'],
		[500, 'UPSTREAM_ERROR'],
	])('sanitiza falha HTTP %s', async (status, code) => {
		const { service, httpService } = createService();
		const error = new AxiosError(
			`request secret-id secret-key`,
			undefined,
			{} as AxiosRequestConfig,
			undefined,
			{ status } as AxiosResponse,
		);
		httpService.get.mockReturnValue(throwError(() => error));

		let caught: unknown;
		try {
			await service.search(searchOptions);
		} catch (value) {
			caught = value;
		}
		expect(caught).toBeInstanceOf(AdzunaIntegrationError);
		expect(caught).toMatchObject({ code });
		expect(String(caught)).not.toContain(credentials.appId);
		expect(String(caught)).not.toContain(credentials.appKey);
	});

	it('transforma timeout em erro acionável', async () => {
		const { service, httpService } = createService();
		httpService.get.mockReturnValue(
			throwError(() => new AxiosError('secret-key', 'ECONNABORTED')),
		);
		await expect(service.search(searchOptions)).rejects.toMatchObject({
			code: 'TIMEOUT',
		});
	});
});
