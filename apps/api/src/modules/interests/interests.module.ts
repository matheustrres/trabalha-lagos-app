import { Module } from '@nestjs/common';

import { InterestsController } from './interests.controller';
import { InterestsRepository } from './interests.repository';
import { InterestsService } from './interests.service';

import { CompaniesModule } from '@/modules/companies/companies.module';
import { JobsModule } from '@/modules/jobs/jobs.module';

@Module({
	imports: [CompaniesModule, JobsModule],
	controllers: [InterestsController],
	providers: [InterestsService, InterestsRepository],
})
export class InterestsModule {}
