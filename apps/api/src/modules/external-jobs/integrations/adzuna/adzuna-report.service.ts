import { Inject, Injectable } from '@nestjs/common';

import { AdzunaService } from './adzuna.service';
import {
	AdzunaIntegrationError,
	isAdzunaIntegrationError,
	type AdzunaJob,
} from './adzuna.types';

import { LAGOS_CITIES, type LagosCity } from '@/common/constants/cities';

export interface AdzunaCommandConfig {
	cities: readonly LagosCity[];
	page: number;
	distanceKm: number;
	resultsPerCity: number;
	maxDaysOld: number;
	sortBy: 'date';
	country: 'br';
}

interface CityFailure {
	city: string;
	code: string;
	message: string;
}

function normalizedDuplicatePart(value: string | undefined): string {
	return (value ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
}

function distribution(
	jobs: readonly AdzunaJob[],
	selector: (job: AdzunaJob) => string | undefined,
): Record<string, number> {
	return jobs.reduce<Record<string, number>>((result, job) => {
		const key = selector(job) ?? 'Não informado';
		result[key] = (result[key] ?? 0) + 1;
		return result;
	}, {});
}

@Injectable()
export class AdzunaReportService {
	constructor(
		@Inject(AdzunaService)
		private readonly adzunaService: AdzunaService,
	) {}

	async run(config: AdzunaCommandConfig): Promise<{
		exitCode: 0 | 1;
		report: Record<string, unknown>;
	}> {
		const receivedByCity: Record<string, number> = {};
		const jobsByCity = new Map<string, AdzunaJob[]>();
		const failures: CityFailure[] = [];
		const rawJobs: AdzunaJob[] = [];
		this.adzunaService.ensureConfigured();

		for (const city of config.cities.slice(0, LAGOS_CITIES.length)) {
			try {
				const result = await this.adzunaService.search({
					city: city.name,
					page: config.page,
					distanceKm: config.distanceKm,
					resultsPerPage: config.resultsPerCity,
					maxDaysOld: config.maxDaysOld,
				});
				receivedByCity[city.slug] = result.jobs.length;
				jobsByCity.set(city.slug, result.jobs);
				rawJobs.push(...result.jobs);
			} catch (error) {
				const sanitized = isAdzunaIntegrationError(error)
					? error
					: new AdzunaIntegrationError(
							'NETWORK_ERROR',
							'Falha inesperada ao consultar a Adzuna.',
						);
				failures.push({
					city: city.slug,
					code: sanitized.code,
					message: sanitized.message,
				});
			}
		}

		const occurrences = new Map<string, { job: AdzunaJob; count: number }>();
		for (const job of rawJobs) {
			const current = occurrences.get(job.externalId);
			occurrences.set(job.externalId, {
				job: current?.job ?? job,
				count: (current?.count ?? 0) + 1,
			});
		}
		const uniqueJobs = [...occurrences.values()].map(({ job }) => job);
		const exactDuplicates = [...occurrences.entries()]
			.filter(([, value]) => value.count > 1)
			.map(([externalId, value]) => ({
				externalId,
				occurrences: value.count,
			}));

		const heuristicGroups = new Map<string, AdzunaJob[]>();
		for (const job of uniqueJobs) {
			const key = [
				normalizedDuplicatePart(job.company),
				normalizedDuplicatePart(job.title),
				job.nearestCitySlug ?? 'unknown',
			].join('|');
			const group = heuristicGroups.get(key) ?? [];
			group.push(job);
			heuristicGroups.set(key, group);
		}
		const possibleDuplicates = [...heuristicGroups.entries()]
			.filter(([, jobs]) => jobs.length > 1)
			.map(([key, jobs]) => ({
				key,
				externalIds: jobs.map((job) => job.externalId),
			}));

		const withCoordinates = uniqueJobs.filter((job) => job.coordinates);
		const suspicious = uniqueJobs.filter(
			(job) => job.geoClassification === 'SUSPICIOUS',
		);

		return {
			exitCode: failures.length === 0 ? 0 : 1,
			report: {
				executedAt: new Date().toISOString(),
				configuration: {
					cities: config.cities.map((city) => city.slug),
					page: config.page,
					distanceKm: config.distanceKm,
					resultsPerCity: config.resultsPerCity,
					maxDaysOld: config.maxDaysOld,
					sortBy: config.sortBy,
					country: config.country,
				},
				requests: {
					attempted: config.cities.length,
					completed: config.cities.length - failures.length,
					failed: failures.length,
					failures,
				},
				receivedByCity,
				totals: { raw: rawJobs.length, unique: uniqueJobs.length },
				exactDuplicates,
				possibleDuplicates,
				coordinateCoverage: {
					withCoordinates: withCoordinates.length,
					withoutCoordinates: uniqueJobs.length - withCoordinates.length,
					percentage:
						uniqueJobs.length === 0
							? 0
							: Number(
									((withCoordinates.length / uniqueJobs.length) * 100).toFixed(
										2,
									),
								),
				},
				geographicAnomalies: suspicious.map((job) => ({
					externalId: job.externalId,
					locationText: job.locationText,
					coordinates: job.coordinates,
					nearestCity: job.nearestCity,
					distanceKm: job.distanceKm,
					isOutsideRegion: job.isOutsideRegion,
					locationDiverges: job.locationDiverges,
				})),
				distribution: {
					category: distribution(uniqueJobs, (job) => job.category),
					contractType: distribution(uniqueJobs, (job) => job.contractType),
				},
				examplesByCity: Object.fromEntries(
					[...jobsByCity.entries()].map(([city, jobs]) => [
						city,
						jobs.slice(0, 3).map((job) => ({
							externalId: job.externalId,
							title: job.title,
							company: job.company,
							locationText: job.locationText,
							nearestCity: job.nearestCity,
							distanceKm: job.distanceKm,
							geoClassification: job.geoClassification,
							publishedAt: job.publishedAt,
						})),
					]),
				),
			},
		};
	}
}
