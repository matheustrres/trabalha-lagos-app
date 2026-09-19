import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

import { classifyGeography } from './adzuna-geography';
import {
	AdzunaIntegrationError,
	isAdzunaIntegrationError,
	type AdzunaJob,
	type AdzunaSearchOptions,
	type AdzunaSearchResult,
} from './adzuna.types';

import { EnvService } from '@/shared/modules/env/env.service';

const ADZUNA_BASE_URL = 'https://api.adzuna.com/v1/api';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
	return typeof value === 'string' && value.trim() ? value : undefined;
}

function optionalNumber(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isFinite(value)
		? value
		: undefined;
}

function nestedString(value: unknown, key: string): string | undefined {
	return isRecord(value) ? optionalString(value[key]) : undefined;
}

function parseArea(value: unknown): string[] {
	if (!isRecord(value) || !Array.isArray(value['area'])) return [];
	return value['area'].filter(
		(item): item is string => typeof item === 'string',
	);
}

@Injectable()
export class AdzunaService {
	constructor(
		@Inject(HttpService)
		private readonly httpService: HttpService,
		@Inject(EnvService)
		private readonly envService: EnvService,
	) {}

	ensureConfigured(): void {
		const appId = this.envService.getKey('ADZUNA_APP_ID');
		const appKey = this.envService.getKey('ADZUNA_APP_KEY');
		if (!appId || !appKey) {
			throw new AdzunaIntegrationError(
				'MISSING_CONFIGURATION',
				'Configure ADZUNA_APP_ID e ADZUNA_APP_KEY para executar a busca.',
			);
		}
	}

	async search(options: AdzunaSearchOptions): Promise<AdzunaSearchResult> {
		this.ensureConfigured();
		const appId = this.envService.getKeyOrThrow('ADZUNA_APP_ID');
		const appKey = this.envService.getKeyOrThrow('ADZUNA_APP_KEY');

		try {
			const response = await firstValueFrom(
				this.httpService.get<unknown>(
					`${ADZUNA_BASE_URL}/jobs/br/search/${options.page}`,
					{
						params: {
							app_id: appId,
							app_key: appKey,
							where: options.city,
							distance: options.distanceKm,
							results_per_page: options.resultsPerPage,
							max_days_old: options.maxDaysOld,
							sort_by: 'date',
						},
					},
				),
			);

			return this.normalizeResponse(response.data);
		} catch (error) {
			if (isAdzunaIntegrationError(error)) throw error;
			throw this.sanitizeTransportError(error);
		}
	}

	private normalizeResponse(payload: unknown): AdzunaSearchResult {
		if (!isRecord(payload) || !Array.isArray(payload['results'])) {
			throw new AdzunaIntegrationError(
				'INVALID_RESPONSE',
				'A Adzuna retornou um payload inválido.',
			);
		}

		const jobs = payload['results'].map((result) => this.normalizeJob(result));
		const count = optionalNumber(payload['count']);
		return { count: count ?? jobs.length, jobs };
	}

	private normalizeJob(value: unknown): AdzunaJob {
		if (!isRecord(value)) this.throwInvalidResponse();

		const externalId = optionalString(value['id']);
		const title = optionalString(value['title']);
		const redirectUrl = optionalString(value['redirect_url']);
		const publishedAt = optionalString(value['created']);
		if (!externalId || !title || !redirectUrl || !publishedAt) {
			this.throwInvalidResponse();
		}

		const latitude = optionalNumber(value['latitude']);
		const longitude = optionalNumber(value['longitude']);
		const coordinates =
			latitude !== undefined && longitude !== undefined
				? { latitude, longitude }
				: undefined;
		const locationText = nestedString(value['location'], 'display_name');

		return {
			externalId,
			source: 'ADZUNA',
			title,
			descriptionSnippet: optionalString(value['description']),
			company: nestedString(value['company'], 'display_name'),
			redirectUrl,
			category: nestedString(value['category'], 'label'),
			contractType: optionalString(value['contract_type']),
			salaryMin: optionalNumber(value['salary_min']),
			salaryMax: optionalNumber(value['salary_max']),
			salaryIsPredicted: value['salary_is_predicted'] === '1',
			locationText,
			locationArea: parseArea(value['location']),
			coordinates,
			publishedAt,
			...classifyGeography(coordinates, locationText),
		};
	}

	private throwInvalidResponse(): never {
		throw new AdzunaIntegrationError(
			'INVALID_RESPONSE',
			'A Adzuna retornou uma vaga com campos obrigatórios inválidos.',
		);
	}

	private sanitizeTransportError(error: unknown): AdzunaIntegrationError {
		if (!(error instanceof AxiosError)) {
			return new AdzunaIntegrationError(
				'NETWORK_ERROR',
				'Falha de rede ao consultar a Adzuna.',
			);
		}

		if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
			return new AdzunaIntegrationError(
				'TIMEOUT',
				'A consulta à Adzuna excedeu o limite de 10 segundos.',
			);
		}

		const status = error.response?.status;
		if (status === 401) {
			return new AdzunaIntegrationError(
				'UNAUTHORIZED',
				'A Adzuna rejeitou as credenciais (HTTP 401).',
			);
		}
		if (status === 403) {
			return new AdzunaIntegrationError(
				'FORBIDDEN',
				'A Adzuna recusou o acesso (HTTP 403); verifique plano e permissões.',
			);
		}
		if (status === 429) {
			return new AdzunaIntegrationError(
				'RATE_LIMITED',
				'A cota da Adzuna foi atingida (HTTP 429).',
			);
		}
		if (status !== undefined && status >= 500) {
			return new AdzunaIntegrationError(
				'UPSTREAM_ERROR',
				`A Adzuna está indisponível (HTTP ${status}).`,
			);
		}

		return new AdzunaIntegrationError(
			'NETWORK_ERROR',
			`Falha ao consultar a Adzuna${status ? ` (HTTP ${status})` : ''}.`,
		);
	}
}
