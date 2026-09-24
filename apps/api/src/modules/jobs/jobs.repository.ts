import { Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, gt, ilike, sql } from 'drizzle-orm';

import type { QueryJobsDto } from './dto/query-jobs.dto';

import {
	DATABASE_TOKEN,
	type Database,
} from '@/shared/modules/database/database.provider';
import {
	type JobSchema,
	type JobStatus,
	jobs,
	categories,
	JobSchemaWithCategoryNoLocation,
	JobSchemaWithDetailsNoLocation,
	JobSchemaWithRelations,
} from '@/shared/modules/database/schema';

type CreateJobData = {
	companyId: string;
	title: string;
	slug: string;
	description: string;
	requirements?: string[];
	categoryId: number;
	contractType: string;
	city: string;
	address?: string;
	location: { x: number; y: number };
	salaryMin?: number;
	salaryMax?: number;
	salaryHidden?: boolean;
	whatsappContact?: string | null;
	contactEmail?: string | null;
	contactMethod?: string;
	featured: boolean;
	urgent: boolean;
	expiresAt: Date;
};

type UpdateJobData = {
	title?: string;
	description?: string;
	requirements?: string[];
	categoryId?: number;
	contractType?: string;
	city?: string;
	address?: string | null;
	location?: { x: number; y: number };
	salaryMin?: number | null;
	salaryMax?: number | null;
	salaryHidden?: boolean;
	whatsappContact?: string | null;
	contactEmail?: string | null;
	contactMethod?: string;
	featured?: boolean;
	urgent?: boolean;
};

@Injectable()
export class JobsRepository {
	constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

	async findByRadius(
		params: QueryJobsDto,
		pagination?: { limit: number; offset: number },
	): Promise<JobSchemaWithDetailsNoLocation[]> {
		const {
			lat,
			lng,
			radius,
			category,
			contractType,
			city,
			featured,
			q,
			page,
			limit,
			sort,
		} = params;
		const hasGeo = lat !== undefined && lng !== undefined;

		const point = hasGeo
			? sql`ST_SetSRID(ST_MakePoint(${lng!}, ${lat!}), 4326)`
			: null;

		// Resolve category ID from slug to avoid cross-table filter in relational API
		let categoryId: number | undefined;
		if (category) {
			const cat = await this.db.query.categories.findFirst({
				where: eq(categories.slug, category),
				columns: { id: true },
			});
			if (!cat) return [];
			categoryId = cat.id;
		}

		const conditions = [
			eq(jobs.status, 'ACTIVE'),
			gt(jobs.expiresAt, sql`NOW()`),
			hasGeo && point
				? sql`ST_DWithin(${jobs.location}::geography, ${point}::geography, ${radius * 1000})`
				: undefined,
			categoryId !== undefined ? eq(jobs.categoryId, categoryId) : undefined,
			contractType ? eq(jobs.contractType, contractType) : undefined,
			city ? eq(jobs.city, city) : undefined,
			featured !== undefined ? eq(jobs.featured, featured) : undefined,
			q ? ilike(jobs.title, `%${q}%`) : undefined,
		];

		const orderExprs =
			hasGeo && point && sort !== 'recent'
				? [
						desc(jobs.featured),
						sql`ST_Distance(${jobs.location}::geography, ${point}::geography)`,
					]
				: [desc(jobs.featured), desc(jobs.createdAt)];

		return this.db.query.jobs.findMany({
			where: and(...conditions),
			with: {
				company: {
					columns: {
						id: true,
						name: true,
						logoUrl: true,
						verified: true,
						plan: true,
					},
				},
				category: {
					columns: { id: true, name: true, slug: true, icon: true },
				},
			},
			columns: { location: false },
			extras: {
				distanceKm: (hasGeo && point
					? sql<
							number | null
						>`ST_Distance(${jobs.location}::geography, ${point}::geography) / 1000`
					: sql<number | null>`NULL`
				).as('distance_km'),
			},
			limit: pagination?.limit ?? limit,
			offset: pagination?.offset ?? (page - 1) * limit,
			orderBy: orderExprs,
		});
	}

	async countByRadius(params: QueryJobsDto): Promise<number> {
		const { lat, lng, radius, category, contractType, city, featured, q } =
			params;
		const hasGeo = lat !== undefined && lng !== undefined;

		const point = hasGeo
			? sql`ST_SetSRID(ST_MakePoint(${lng!}, ${lat!}), 4326)`
			: null;

		let categoryId: number | undefined;
		if (category) {
			const cat = await this.db.query.categories.findFirst({
				where: eq(categories.slug, category),
				columns: { id: true },
			});
			if (!cat) return 0;
			categoryId = cat.id;
		}

		const conditions = [
			eq(jobs.status, 'ACTIVE'),
			gt(jobs.expiresAt, sql`NOW()`),
			hasGeo && point
				? sql`ST_DWithin(${jobs.location}::geography, ${point}::geography, ${radius * 1000})`
				: undefined,
			categoryId !== undefined ? eq(jobs.categoryId, categoryId) : undefined,
			contractType ? eq(jobs.contractType, contractType) : undefined,
			city ? eq(jobs.city, city) : undefined,
			featured !== undefined ? eq(jobs.featured, featured) : undefined,
			q ? ilike(jobs.title, `%${q}%`) : undefined,
		];

		const [result] = await this.db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(jobs)
			.where(and(...conditions));

		return result?.count ?? 0;
	}

	async findBySlug(slug: string): Promise<JobSchemaWithRelations | null> {
		const row = await this.db.query.jobs.findFirst({
			where: eq(jobs.slug, slug),
			with: {
				company: {
					columns: {
						id: true,
						name: true,
						logoUrl: true,
						verified: true,
						plan: true,
					},
				},
				category: {
					columns: { id: true, name: true, slug: true, icon: true },
				},
			},
			columns: { location: false },
		});
		return row ?? null;
	}

	async findById(id: string): Promise<JobSchema | null> {
		const [row] = await this.db
			.select()
			.from(jobs)
			.where(eq(jobs.id, id))
			.limit(1);
		return row ?? null;
	}

	async findByCompanyId(
		companyId: string,
	): Promise<JobSchemaWithCategoryNoLocation[]> {
		return this.db.query.jobs.findMany({
			where: eq(jobs.companyId, companyId),
			with: {
				category: {
					columns: { id: true, name: true, slug: true, icon: true },
				},
			},
			columns: { location: false },
			orderBy: [desc(jobs.createdAt)],
		});
	}

	async create(data: CreateJobData): Promise<JobSchema> {
		const [row] = await this.db
			.insert(jobs)
			.values({
				companyId: data.companyId,
				title: data.title,
				slug: data.slug,
				description: data.description,
				requirements: data.requirements ?? [],
				categoryId: data.categoryId,
				contractType: data.contractType as typeof jobs.contractType._.data,
				city: data.city,
				address: data.address,
				location: data.location,
				salaryMin: data.salaryMin,
				salaryMax: data.salaryMax,
				salaryHidden: data.salaryHidden ?? false,
				whatsappContact: data.whatsappContact,
				contactEmail: data.contactEmail,
				contactMethod: (data.contactMethod ??
					'WHATSAPP') as typeof jobs.contactMethod._.data,
				featured: data.featured,
				urgent: data.urgent,
				expiresAt: data.expiresAt,
			})
			.returning();
		return row!;
	}

	async update(id: string, data: UpdateJobData): Promise<JobSchema | null> {
		const set: Partial<typeof jobs.$inferInsert> = { updatedAt: new Date() };

		if (data.title !== undefined) set.title = data.title;
		if (data.description !== undefined) set.description = data.description;
		if (data.requirements !== undefined) set.requirements = data.requirements;
		if (data.categoryId !== undefined) set.categoryId = data.categoryId;
		if (data.contractType !== undefined)
			set.contractType = data.contractType as typeof jobs.contractType._.data;
		if (data.city !== undefined) set.city = data.city;
		if (data.address !== undefined) set.address = data.address;
		if (data.location !== undefined) set.location = data.location;
		if (data.salaryMin !== undefined) set.salaryMin = data.salaryMin;
		if (data.salaryMax !== undefined) set.salaryMax = data.salaryMax;
		if (data.salaryHidden !== undefined) set.salaryHidden = data.salaryHidden;
		if (data.whatsappContact !== undefined)
			set.whatsappContact = data.whatsappContact;
		if (data.contactEmail !== undefined) set.contactEmail = data.contactEmail;
		if (data.contactMethod !== undefined)
			set.contactMethod =
				data.contactMethod as typeof jobs.contactMethod._.data;
		if (data.featured !== undefined) set.featured = data.featured;
		if (data.urgent !== undefined) set.urgent = data.urgent;

		const [row] = await this.db
			.update(jobs)
			.set(set)
			.where(eq(jobs.id, id))
			.returning();
		return row ?? null;
	}

	async updateStatus(id: string, status: JobStatus): Promise<JobSchema | null> {
		const [row] = await this.db
			.update(jobs)
			.set({ status, updatedAt: new Date() })
			.where(eq(jobs.id, id))
			.returning();
		return row ?? null;
	}

	async countActiveByCompanyId(companyId: string): Promise<number> {
		const [result] = await this.db
			.select({ count: sql<number>`COUNT(*)::int` })
			.from(jobs)
			.where(and(eq(jobs.companyId, companyId), eq(jobs.status, 'ACTIVE')));
		return result?.count ?? 0;
	}

	async incrementViewCount(id: string, count: number = 1): Promise<void> {
		await this.db
			.update(jobs)
			.set({ viewCount: sql`${jobs.viewCount} + ${count}` })
			.where(eq(jobs.id, id));
	}
}
