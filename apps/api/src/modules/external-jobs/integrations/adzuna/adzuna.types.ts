export type AdzunaGeoClassification =
	| 'VALID'
	| 'SUSPICIOUS'
	| 'WITHOUT_COORDINATES';

export interface AdzunaCoordinates {
	latitude: number;
	longitude: number;
}

export interface AdzunaJob {
	externalId: string;
	source: 'ADZUNA';
	title: string;
	descriptionSnippet?: string;
	company?: string;
	redirectUrl: string;
	category?: string;
	contractType?: string;
	salaryMin?: number;
	salaryMax?: number;
	salaryIsPredicted: boolean;
	locationText?: string;
	locationArea: string[];
	coordinates?: AdzunaCoordinates;
	publishedAt: string;
	nearestCity?: string;
	nearestCitySlug?: string;
	distanceKm?: number;
	geoClassification: AdzunaGeoClassification;
	isOutsideRegion: boolean;
	locationDiverges: boolean;
}

export interface AdzunaSearchOptions {
	city: string;
	page: number;
	distanceKm: number;
	resultsPerPage: number;
	maxDaysOld: number;
}

export interface AdzunaSearchResult {
	count: number;
	jobs: AdzunaJob[];
}

export type AdzunaErrorCode =
	| 'MISSING_CONFIGURATION'
	| 'UNAUTHORIZED'
	| 'FORBIDDEN'
	| 'RATE_LIMITED'
	| 'UPSTREAM_ERROR'
	| 'TIMEOUT'
	| 'INVALID_RESPONSE'
	| 'NETWORK_ERROR';

export class AdzunaIntegrationError extends Error {
	constructor(
		public readonly code: AdzunaErrorCode,
		message: string,
	) {
		super(message);
		this.name = 'AdzunaIntegrationError';
	}
}

export function isAdzunaIntegrationError(
	error: unknown,
): error is AdzunaIntegrationError {
	const integrationCodes: readonly AdzunaErrorCode[] = [
		'MISSING_CONFIGURATION',
		'UNAUTHORIZED',
		'FORBIDDEN',
		'RATE_LIMITED',
		'UPSTREAM_ERROR',
		'TIMEOUT',
		'INVALID_RESPONSE',
		'NETWORK_ERROR',
	];
	return (
		error instanceof Error &&
		'code' in error &&
		integrationCodes.includes(
			(error as { code?: AdzunaErrorCode }).code as AdzunaErrorCode,
		)
	);
}
