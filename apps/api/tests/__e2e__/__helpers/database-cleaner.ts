import { sql } from 'drizzle-orm';

import type { Database } from '@/shared/modules/database/database.provider';

export async function cleanDatabase(db: Database): Promise<void> {
	const result = await db.execute<{ tablename: string }>(sql`
		SELECT tablename FROM pg_tables
		WHERE schemaname = 'public'
	`);

	const tables = result.rows.map((r) => r.tablename);
	if (tables.length === 0) return;

	const tableList = tables.map((t) => `"public"."${t}"`).join(', ');
	await db.execute(sql.raw(`TRUNCATE ${tableList} RESTART IDENTITY CASCADE`));
}
