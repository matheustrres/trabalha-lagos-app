import { Module } from '@nestjs/common';

import { ExternalJobsRepository } from './external-jobs.repository';
import { JobsController } from './jobs.controller';
import { JobsRepository } from './jobs.repository';
import { JobsService } from './jobs.service';
import { ViewCounterProcessor } from './processors/view-counter.processor';
import { ViewCounterService } from './services/view-counter.service';

import { CompaniesModule } from '@/modules/companies/companies.module';

import { RedisModule } from '@/shared/modules/redis/redis.module';

@Module({
	imports: [CompaniesModule, RedisModule],
	controllers: [JobsController],
	providers: [
		JobsService,
		JobsRepository,
		ExternalJobsRepository,
		ViewCounterService,
		ViewCounterProcessor,
	],
	exports: [JobsService],
})
export class JobsModule {}
