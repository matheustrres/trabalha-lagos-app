import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';

import {
	DATABASE_TOKEN,
	type Database,
} from '@/shared/modules/database/database.provider';
import {
	interests,
	InterestSchema,
	InterestSchemaWithJobTitle,
	InterestSchemaWithUserAndJobIds,
	InterestStatus,
	jobs,
} from '@/shared/modules/database/schema';

type CreateInterestData = {
	userId?: string;
	jobId: string;
	name: string;
	phone: string;
	city: string;
};

type FindByCompanyFilters = {
	status?: InterestStatus;
	jobId?: string;
};

@Injectable()
export class InterestsRepository {
	constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

	async create(data: CreateInterestData): Promise<InterestSchema> {
		try {
			const [row] = await this.db
				.insert(interests)
				.values({
					userId: data.userId,
					jobId: data.jobId,
					name: data.name,
					phone: data.phone,
					city: data.city,
				})
				.returning();
			return row!;
		} catch (err: unknown) {
			if (
				err instanceof Error &&
				'code' in err &&
				(err as { code: string }).code === '23505'
			) {
				throw new ConflictException('Você já demonstrou interesse nesta vaga.');
			}
			throw err;
		}
	}

	async findByJobId(jobId: string) {
		return this.db.query.interests.findMany({
			where: eq(interests.jobId, jobId),
			orderBy: [desc(interests.createdAt)],
		});
	}

	async findByUserIdAndJobId(
		userId: string,
		jobId: string,
	): Promise<InterestSchemaWithUserAndJobIds | null> {
		const [row] = await this.db
			.select()
			.from(interests)
			.where(and(eq(interests.userId, userId), eq(interests.jobId, jobId)))
			.limit(1);
		return row ?? null;
	}

	async findByCompanyJobs(
		companyId: string,
		filters?: FindByCompanyFilters,
	): Promise<InterestSchemaWithJobTitle[]> {
		// Resolve company jobs first to filter at DB level without cross-table joins
		const companyJobs = await this.db
			.select({ id: jobs.id, title: jobs.title })
			.from(jobs)
			.where(eq(jobs.companyId, companyId));

		if (companyJobs.length === 0) return [];

		const titleMap = new Map(companyJobs.map((j) => [j.id, j.title]));

		let jobIds = companyJobs.map((j) => j.id);
		if (filters?.jobId) {
			// Restrict to the specific jobId only if it belongs to this company
			if (!titleMap.has(filters.jobId)) return [];
			jobIds = [filters.jobId];
		}

		const conditions = [
			inArray(interests.jobId, jobIds),
			filters?.status ? eq(interests.status, filters.status) : undefined,
		].filter((c) => c !== undefined);

		const rows = await this.db
			.select()
			.from(interests)
			.where(and(...conditions))
			.orderBy(desc(interests.createdAt));

		return rows.map((row) => ({
			id: row.id,
			name: row.name,
			phone: row.phone,
			city: row.city,
			status: row.status as InterestStatus,
			createdAt: row.createdAt,
			userId: row.userId,
			jobId: row.jobId,
			jobTitle: titleMap.get(row.jobId) ?? '',
		}));
	}

	async updateStatus(
		id: string,
		status: InterestStatus,
	): Promise<InterestSchema | null> {
		const [row] = await this.db
			.update(interests)
			.set({ status })
			.where(eq(interests.id, id))
			.returning();
		return row ?? null;
	}

	async findById(id: string): Promise<InterestSchema | null> {
		const [row] = await this.db
			.select()
			.from(interests)
			.where(eq(interests.id, id))
			.limit(1);
		return row ?? null;
	}

	async incrementJobInterestCount(jobId: string): Promise<void> {
		await this.db
			.update(jobs)
			.set({ interestCount: sql`${jobs.interestCount} + 1` })
			.where(eq(jobs.id, jobId));
	}
}
