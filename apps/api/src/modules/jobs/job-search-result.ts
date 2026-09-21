import type { SearchableExternalJob } from './external-jobs.repository';

import type { JobSchemaWithDetailsNoLocation } from '@/shared/modules/database/schema';

export type InternalJobSearchResult = JobSchemaWithDetailsNoLocation & {
	sourceType: 'INTERNAL';
};

export type ExternalJobSearchResult = {
	sourceType: 'EXTERNAL';
	id: string;
	externalSource: string;
	title: string;
	description: string;
	companyName: string;
	redirectUrl: string | null;
	categoryName: string | null;
	contractType: string | null;
	salaryMin: number | null;
	salaryMax: number | null;
	salaryPredicted: boolean;
	locationText: string;
	city: string;
	distanceKm: number | null;
	publishedAt: Date;
	expiresAt: Date | null;
};

export type JobSearchResult = InternalJobSearchResult | ExternalJobSearchResult;

const sanitizeText = (
	value: string | null | undefined,
	maxLength: number,
): string | null => {
	if (!value) return null;
	const sanitized = value
		.replace(/<[^>]*>/g, ' ')
		.replace(/[\u0000-\u001F\u007F]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.slice(0, maxLength);
	return sanitized || null;
};

const sanitizeRedirectUrl = (value: string): string | null => {
	try {
		const url = new URL(value);
		return url.protocol === 'https:' || url.protocol === 'http:'
			? url.toString()
			: null;
	} catch {
		return null;
	}
};

export const mapInternalJobSearchResult = (
	job: JobSchemaWithDetailsNoLocation,
): InternalJobSearchResult => ({ sourceType: 'INTERNAL', ...job });

export const mapExternalJobSearchResult = (
	job: SearchableExternalJob,
): ExternalJobSearchResult => ({
	sourceType: 'EXTERNAL',
	id: job.id,
	externalSource: sanitizeText(job.source, 40) ?? 'EXTERNAL',
	title: sanitizeText(job.title, 180) ?? 'Vaga externa',
	description: sanitizeText(job.descriptionSnippet, 600) ?? '',
	companyName: sanitizeText(job.company, 160) ?? 'Empresa não informada',
	redirectUrl: sanitizeRedirectUrl(job.redirectUrl),
	categoryName: sanitizeText(job.categoryOriginal, 120),
	contractType: sanitizeText(job.contractTypeOriginal, 80),
	salaryMin: job.salaryMin,
	salaryMax: job.salaryMax,
	salaryPredicted: job.salaryPredicted,
	locationText:
		sanitizeText(job.locationText, 180) ?? 'Localização não informada',
	city: job.city,
	distanceKm: job.distanceKm,
	publishedAt: job.publishedAt,
	expiresAt: job.expiresAt,
});
