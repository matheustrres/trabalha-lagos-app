import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { ViewCounterService } from '../services/view-counter.service';

const VIEW_COUNTER_FLUSH_CRON =
	process.env['VIEW_COUNTER_FLUSH_CRON'] ?? '*/5 * * * *';

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

	@Cron(VIEW_COUNTER_FLUSH_CRON)
	async process(): Promise<void> {
		this.logger.log(
			`Running view counter flush to database (cron: ${VIEW_COUNTER_FLUSH_CRON})...`,
		);
		await this.viewCounterService.flushToDatabase();
	}
}
