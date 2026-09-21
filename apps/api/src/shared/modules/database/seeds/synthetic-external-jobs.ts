import type { NewExternalJobSchema } from '../schema/external-jobs';

import { LAGOS_CITIES } from '@/common/constants/cities';

const SYNTHETIC_JOB_TEMPLATES = [
	{
		title: 'Atendente de loja',
		categoryOriginal: 'Comércio e varejo',
		contractTypeOriginal: 'CLT',
		salaryMin: 165000,
		salaryMax: 210000,
	},
	{
		title: 'Auxiliar administrativo',
		categoryOriginal: 'Administrativo',
		contractTypeOriginal: 'CLT',
		salaryMin: 180000,
		salaryMax: 240000,
	},
] as const;

export const SYNTHETIC_EXTERNAL_JOB_SOURCE = 'SYNTHETIC';

export function buildSyntheticExternalJobs(
	now = new Date(),
): NewExternalJobSchema[] {
	return LAGOS_CITIES.flatMap((city, cityIndex) =>
		SYNTHETIC_JOB_TEMPLATES.map((template, templateIndex) => {
			const sequence =
				cityIndex * SYNTHETIC_JOB_TEMPLATES.length + templateIndex;
			const publishedAt = new Date(now);
			publishedAt.setUTCDate(publishedAt.getUTCDate() - (sequence % 10));
			const expiresAt = new Date(now);
			expiresAt.setUTCDate(expiresAt.getUTCDate() + 30 + (sequence % 7));

			return {
				source: SYNTHETIC_EXTERNAL_JOB_SOURCE,
				externalId: `synthetic-${city.slug}-${templateIndex + 1}`,
				title: template.title,
				descriptionSnippet:
					'Vaga fictícia para validar localmente a experiência de vagas externas. Não representa uma oportunidade real.',
				company: `Empresa Fictícia ${cityIndex + 1}`,
				redirectUrl: `https://example.invalid/vagas/synthetic-${city.slug}-${templateIndex + 1}`,
				categoryOriginal: template.categoryOriginal,
				contractTypeOriginal: template.contractTypeOriginal,
				salaryMin: template.salaryMin,
				salaryMax: template.salaryMax,
				salaryPredicted: false,
				locationText: `${city.name}, Rio de Janeiro`,
				locationArea: [city.name, 'Rio de Janeiro', 'Brasil'],
				city: city.slug,
				location: { x: city.lng, y: city.lat },
				publishedAt,
				status: 'ACTIVE',
				firstSeenAt: now,
				lastSeenAt: now,
				expiresAt,
				updatedAt: now,
			};
		}),
	);
}
