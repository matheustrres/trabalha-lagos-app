import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AdzunaReportService } from './adzuna-report.service';
import { AdzunaService } from './adzuna.service';

import { EnvModule } from '@/shared/modules/env/env.module';

@Module({
	imports: [HttpModule.register({ timeout: 10_000 }), EnvModule],
	providers: [AdzunaService, AdzunaReportService],
	exports: [AdzunaService, AdzunaReportService],
})
export class AdzunaModule {}
