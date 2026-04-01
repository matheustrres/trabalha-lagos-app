import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import {
	DATABASE_TOKEN,
	type Database,
} from '@/shared/modules/database/database.provider';
import {
	companies,
	CompanySchema,
	CompanySchemaWithUser,
} from '@/shared/modules/database/schema';

type CreateCompanyData = {
	userId: string;
	name: string;
	document: string;
	city: string;
	whatsapp?: string;
};

type UpdateCompanyData = {
	name?: string;
	document?: string;
	segment?: string;
	whatsapp?: string;
	logoUrl?: string;
};

@Injectable()
export class CompaniesRepository {
	constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

	async findById(id: string): Promise<CompanySchemaWithUser | null> {
		const row = await this.db.query.companies.findFirst({
			where: eq(companies.id, id),
			with: {
				user: {
					columns: { id: true, name: true, phone: true, city: true },
				},
			},
		});
		return row ?? null;
	}

	async findByUserId(userId: string): Promise<CompanySchema | null> {
		const [row] = await this.db
			.select()
			.from(companies)
			.where(eq(companies.userId, userId))
			.limit(1);
		return row ?? null;
	}

	async create(data: CreateCompanyData): Promise<CompanySchema> {
		const [row] = await this.db
			.insert(companies)
			.values({
				userId: data.userId,
				name: data.name,
				document: data.document,
				city: data.city,
				whatsapp: data.whatsapp,
				plan: 'FREE',
			})
			.returning();
		return row!;
	}

	async update(
		id: string,
		data: UpdateCompanyData,
	): Promise<CompanySchema | null> {
		const [row] = await this.db
			.update(companies)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(companies.id, id))
			.returning();
		return row ?? null;
	}
}
