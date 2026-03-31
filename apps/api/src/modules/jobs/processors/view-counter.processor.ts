import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { ViewCounterService } from '../services/view-counter.service';

@Processor('view-counter')
@Injectable()
export class ViewCounterProcessor extends WorkerHost {
	private readonly logger = new Logger(ViewCounterProcessor.name);

	constructor(
		@Inject(ViewCounterService)
		private readonly viewCounterService: ViewCounterService,
	) {
		super();
	}

	@Cron('*/5 * * * *')
	async process(): Promise<void> {
		this.logger.log('Running view counter flush to database...');
		await this.viewCounterService.flushToDatabase();
	}
}
