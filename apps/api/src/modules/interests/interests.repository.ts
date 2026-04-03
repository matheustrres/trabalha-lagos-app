import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';

import {
	DATABASE_TOKEN,
	type Database,
} from '@/shared/modules/database/database.provider';
import {
	interests,
	InterestSchema,
	InterestSchemaWithUserAndJobIds,
	InterestStatus,
	jobs,
	users,
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
	availability?: 'IMMEDIATE' | 'IN_15_DAYS' | 'IN_30_DAYS' | 'NEGOTIABLE';
	area?: string;
};

export type InterestWithCandidateProfileRow = {
	id: string;
	name: string;
	phone: string;
	city: string;
	status: InterestStatus;
	createdAt: Date;
	userId: string | null;
	jobId: string;
	jobTitle: string;
	jobSlug: string;
	candidateInterests: string[] | null;
	candidateExperience: string | null;
	candidateAvailability:
		| 'IMMEDIATE'
		| 'IN_15_DAYS'
		| 'IN_30_DAYS'
		| 'NEGOTIABLE'
		| null;
	candidateAcceptedContractTypes: string[] | null;
	candidateNeighborhood: string | null;
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
	): Promise<InterestWithCandidateProfileRow[]> {
		// Resolve company jobs first to filter at DB level without cross-table joins
		const companyJobs = await this.db
			.select({ id: jobs.id, title: jobs.title, slug: jobs.slug })
			.from(jobs)
			.where(eq(jobs.companyId, companyId));

		if (companyJobs.length === 0) return [];

		const jobMetaMap = new Map(
			companyJobs.map((job) => [job.id, { title: job.title, slug: job.slug }]),
		);

		let jobIds = companyJobs.map((j) => j.id);
		if (filters?.jobId) {
			// Restrict to the specific jobId only if it belongs to this company
			if (!jobMetaMap.has(filters.jobId)) return [];
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

		const userIds = rows
			.map((row) => row.userId)
			.filter((userId): userId is string => Boolean(userId));

		const profiles =
			userIds.length > 0
				? await this.db
						.select({
							id: users.id,
							interests: users.interests,
							experience: users.experience,
							availability: users.availability,
							acceptedContractTypes: users.acceptedContractTypes,
							neighborhood: users.neighborhood,
						})
						.from(users)
						.where(inArray(users.id, userIds))
				: [];

		const profileMap = new Map(
			profiles.map((profile) => [profile.id, profile]),
		);

		return rows
			.map((row) => {
				const profile = row.userId ? profileMap.get(row.userId) : undefined;
				const jobMeta = jobMetaMap.get(row.jobId);

				return {
					id: row.id,
					name: row.name,
					phone: row.phone,
					city: row.city,
					status: row.status as InterestStatus,
					createdAt: row.createdAt,
					userId: row.userId,
					jobId: row.jobId,
					jobTitle: jobMeta?.title ?? '',
					jobSlug: jobMeta?.slug ?? '',
					candidateInterests: profile?.interests ?? null,
					candidateExperience: profile?.experience ?? null,
					candidateAvailability: profile?.availability ?? null,
					candidateAcceptedContractTypes:
						profile?.acceptedContractTypes ?? null,
					candidateNeighborhood: profile?.neighborhood ?? null,
				};
			})
			.filter((row) => {
				if (
					filters?.availability &&
					row.candidateAvailability !== filters.availability
				) {
					return false;
				}

				if (filters?.area) {
					return row.candidateInterests?.includes(filters.area) ?? false;
				}

				return true;
			});
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
