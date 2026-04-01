import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';

import {
	DATABASE_TOKEN,
	type Database,
} from '@/shared/modules/database/database.provider';
import { categories, CategorySchema } from '@/shared/modules/database/schema';

export type CategoryRow = Record<string, unknown> & {
	id: number;
	name: string;
	slug: string;
	icon: string;
	order: number;
	jobCount: number;
};

@Injectable()
export class CategoriesRepository {
	constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

	async findAll(): Promise<CategoryRow[]> {
		const result = await this.db.execute<CategoryRow>(sql`
			SELECT
				c.id,
				c.name,
				c.slug,
				c.icon,
				c."order",
				COUNT(j.id)::int AS "jobCount"
			FROM categories c
			LEFT JOIN jobs j ON j.category_id = c.id AND j.status = 'ACTIVE'
			GROUP BY c.id
			ORDER BY c."order"
		`);
		return result.rows;
	}

	async findBySlug(slug: string): Promise<CategorySchema | null> {
		const [category] = await this.db
			.select()
			.from(categories)
			.where(eq(categories.slug, slug))
			.limit(1);
		return category ?? null;
	}
}
