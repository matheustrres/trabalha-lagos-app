import type { AdzunaCommandConfig } from './adzuna-report.service';

import { LAGOS_CITIES, type LagosCity } from '@/common/constants/cities';

function positiveNumber(value: string | undefined, name: string): number {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		throw new Error(`O argumento --${name} deve ser um número maior que zero.`);
	}
	return parsed;
}

export function parseAdzunaArguments(
	args: readonly string[],
): AdzunaCommandConfig {
	const values = new Map<string, string>();
	for (const argument of args) {
		if (argument === '--') continue;
		const match = /^--([a-z-]+)=(.+)$/.exec(argument);
		if (!match?.[1] || !match[2])
			throw new Error(`Argumento inválido: ${argument}`);
		values.set(match[1], match[2]);
	}

	const citySlug = values.get('city');
	const selectedCity = citySlug
		? LAGOS_CITIES.find((city) => city.slug === citySlug)
		: undefined;
	if (citySlug && !selectedCity) {
		throw new Error(
			`Cidade inválida. Use: ${LAGOS_CITIES.map((city) => city.slug).join(', ')}.`,
		);
	}

	const allowedArguments = new Set([
		'city',
		'distance',
		'results',
		'max-days-old',
	]);
	for (const key of values.keys()) {
		if (!allowedArguments.has(key))
			throw new Error(`Argumento desconhecido: --${key}`);
	}

	return {
		cities: selectedCity
			? ([selectedCity] as readonly LagosCity[])
			: LAGOS_CITIES,
		page: 1,
		distanceKm: positiveNumber(values.get('distance') ?? '25', 'distance'),
		resultsPerCity: positiveNumber(values.get('results') ?? '20', 'results'),
		maxDaysOld: positiveNumber(
			values.get('max-days-old') ?? '30',
			'max-days-old',
		),
		sortBy: 'date',
		country: 'br',
	};
}
