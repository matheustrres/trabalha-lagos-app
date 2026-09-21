import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gt, ilike, isNull, or, sql } from 'drizzle-orm';

import type { QueryJobsDto } from './dto/query-jobs.dto';

import { LAGOS_CITIES } from '@/common/constants/cities';

import {
	DATABASE_TOKEN,
	type Database,
} from '@/shared/modules/database/database.provider';
import {
	externalJobs,
	type ExternalJobSchema,
} from '@/shared/modules/database/schema';

export type SearchableExternalJob = Omit<ExternalJobSchema, 'location'> & {
	distanceKm: number | null;
};

const PUBLIC_EXTERNAL_SOURCE = 'SYNTHETIC';

@Injectable()
export class ExternalJobsRepository {
	constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

	async findForPublicSearch(
		params: QueryJobsDto,
		limit: number,
	): Promise<SearchableExternalJob[]> {
		const point = this.buildPoint(params);
		const conditions = this.buildConditions(params, point);

		return this.db.query.externalJobs.findMany({
			where: and(...conditions),
			columns: { location: false },
			extras: {
				distanceKm: (point
					? sql<
							number | null
						>`ST_Distance(${externalJobs.location}::geography, ${point}::geography) / 1000`
					: sql<number | null>`NULL`
				).as('distance_km'),
			},
			limit,
			orderBy:
				point && params.sort !== 'recent'
					? [
							sql`ST_Distance(${externalJobs.location}::geography, ${point}::geography)`,
						]
					: [desc(externalJobs.publishedAt)],
		});
	}

	async countForPublicSearch(params: QueryJobsDto): Promise<number> {
		const point = this.buildPoint(params);
		const [result] = await this.db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(externalJobs)
			.where(and(...this.buildConditions(params, point)));

		return result?.count ?? 0;
	}

	private buildPoint(params: QueryJobsDto) {
		if (params.lat === undefined || params.lng === undefined) return null;
		return sql`ST_SetSRID(ST_MakePoint(${params.lng}, ${params.lat}), 4326)`;
	}

	private buildConditions(
		params: QueryJobsDto,
		point: ReturnType<ExternalJobsRepository['buildPoint']>,
	) {
		const citySlug = params.city
			? LAGOS_CITIES.find(
					(city) => city.name === params.city || city.slug === params.city,
				)?.slug
			: undefined;

		return [
			process.env['NODE_ENV'] === 'production' ? sql`FALSE` : undefined,
			eq(externalJobs.source, PUBLIC_EXTERNAL_SOURCE),
			eq(externalJobs.status, 'ACTIVE'),
			or(
				isNull(externalJobs.expiresAt),
				gt(externalJobs.expiresAt, sql`NOW()`),
			),
			point
				? sql`${externalJobs.location} IS NOT NULL AND ST_DWithin(${externalJobs.location}::geography, ${point}::geography, ${params.radius * 1000})`
				: undefined,
			params.featured === true ? sql`FALSE` : undefined,
			params.category ? sql`FALSE` : undefined,
			params.contractType
				? eq(externalJobs.contractTypeOriginal, params.contractType)
				: undefined,
			params.city
				? citySlug
					? eq(externalJobs.city, citySlug)
					: sql`FALSE`
				: undefined,
			params.q ? ilike(externalJobs.title, `%${params.q}%`) : undefined,
		];
	}
}
