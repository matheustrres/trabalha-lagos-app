import '@/shared/module-alias';

import { NestFactory } from '@nestjs/core';

import { parseAdzunaArguments } from './adzuna-command-options';
import { AdzunaReportService } from './adzuna-report.service';
import { AdzunaModule } from './adzuna.module';
import { isAdzunaIntegrationError } from './adzuna.types';

export async function main(args = process.argv.slice(2)): Promise<number> {
	try {
		const config = parseAdzunaArguments(args);
		const application = await NestFactory.createApplicationContext(
			AdzunaModule,
			{
				logger: false,
			},
		);
		try {
			const result = await application.get(AdzunaReportService).run(config);
			process.stdout.write(`${JSON.stringify(result.report, null, 2)}\n`);
			return result.exitCode;
		} finally {
			await application.close();
		}
	} catch (error) {
		const message =
			error instanceof Error ? error.message : 'Falha inesperada.';
		const code = isAdzunaIntegrationError(error)
			? error.code
			: 'INVALID_COMMAND';
		process.stdout.write(
			`${JSON.stringify(
				{
					executedAt: new Date().toISOString(),
					requests: { attempted: 0, completed: 0, failed: 0 },
					error: { code, message },
				},
				null,
				2,
			)}\n`,
		);
		return 1;
	}
}

if (require.main === module) {
	void main().then((exitCode) => {
		process.exitCode = exitCode;
	});
}
