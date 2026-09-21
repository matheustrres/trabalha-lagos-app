import 'dotenv/config';

import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { externalJobs } from './schema/external-jobs';
import {
	buildSyntheticExternalJobs,
	SYNTHETIC_EXTERNAL_JOB_SOURCE,
} from './seeds/synthetic-external-jobs';

export function assertLocalSeedEnvironment(): void {
	if (process.env['NODE_ENV'] === 'production') {
		throw new Error(
			'O seed de vagas externas sintéticas não pode ser executado em produção.',
		);
	}
}

export function assertLocalDatabaseUrl(databaseUrl: string): void {
	let hostname: string;
	try {
		hostname = new URL(databaseUrl).hostname;
	} catch {
		throw new Error('DATABASE_URL inválida.');
	}

	if (!['localhost', '127.0.0.1', '[::1]'].includes(hostname)) {
		throw new Error(
			'O seed sintético aceita somente um DATABASE_URL local (localhost, 127.0.0.1 ou ::1).',
		);
	}
}

export async function main(): Promise<void> {
	assertLocalSeedEnvironment();

	const databaseUrl = process.env['DATABASE_URL'];
	if (!databaseUrl) {
		throw new Error('DATABASE_URL não configurada.');
	}
	assertLocalDatabaseUrl(databaseUrl);

	const pool = new Pool({ connectionString: databaseUrl });
	const db = drizzle(pool);
	const syntheticJobs = buildSyntheticExternalJobs();

	try {
		await db
			.insert(externalJobs)
			.values(syntheticJobs)
			.onConflictDoUpdate({
				target: [externalJobs.source, externalJobs.externalId],
				set: {
					title: sql`excluded.title`,
					descriptionSnippet: sql`excluded.description_snippet`,
					company: sql`excluded.company`,
					redirectUrl: sql`excluded.redirect_url`,
					categoryOriginal: sql`excluded.category_original`,
					contractTypeOriginal: sql`excluded.contract_type_original`,
					salaryMin: sql`excluded.salary_min`,
					salaryMax: sql`excluded.salary_max`,
					salaryPredicted: sql`excluded.salary_predicted`,
					locationText: sql`excluded.location_text`,
					locationArea: sql`excluded.location_area`,
					city: sql`excluded.city`,
					location: sql`excluded.location`,
					publishedAt: sql`excluded.published_at`,
					status: 'ACTIVE',
					lastSeenAt: sql`excluded.last_seen_at`,
					expiresAt: sql`excluded.expires_at`,
					updatedAt: sql`excluded.updated_at`,
				},
			});

		process.stdout.write(
			`Seed concluído: ${syntheticJobs.length} vagas externas sintéticas (${SYNTHETIC_EXTERNAL_JOB_SOURCE}).\n`,
		);
	} finally {
		await pool.end();
	}
}

if (require.main === module) {
	void main().catch((error: unknown) => {
		const message =
			error instanceof Error && error.message
				? error.message
				: 'Não foi possível conectar ao banco local.';
		process.stderr.write(`Falha no seed: ${message}\n`);
		process.exitCode = 1;
	});
}
