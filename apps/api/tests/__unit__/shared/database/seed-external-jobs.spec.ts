import {
	assertLocalDatabaseUrl,
	assertLocalSeedEnvironment,
} from '@/shared/modules/database/seed-external-jobs';

describe('external jobs local seed safeguards', () => {
	const originalNodeEnv = process.env['NODE_ENV'];

	afterEach(() => {
		process.env['NODE_ENV'] = originalNodeEnv;
	});

	it.each([
		'postgresql://user:password@localhost:5432/database',
		'postgresql://user:password@127.0.0.1:5432/database',
		'postgresql://user:password@[::1]:5432/database',
	])('accepts a local database URL: %s', (databaseUrl) => {
		expect(() => assertLocalDatabaseUrl(databaseUrl)).not.toThrow();
	});

	it('rejects a remote database URL', () => {
		expect(() =>
			assertLocalDatabaseUrl(
				'postgresql://user:password@database.example.com:5432/database',
			),
		).toThrow('somente um DATABASE_URL local');
	});

	it('rejects malformed database URLs', () => {
		expect(() => assertLocalDatabaseUrl('not-a-url')).toThrow(
			'DATABASE_URL inválida',
		);
	});

	it('rejects production execution', () => {
		process.env['NODE_ENV'] = 'production';

		expect(() => assertLocalSeedEnvironment()).toThrow(
			'não pode ser executado em produção',
		);
	});
});
