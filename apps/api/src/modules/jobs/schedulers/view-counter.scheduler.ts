import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { ViewCounterService } from '../services/view-counter.service';

const VIEW_COUNTER_FLUSH_CRON =
	process.env['VIEW_COUNTER_FLUSH_CRON'] ?? '*/5 * * * *';

@Injectable()
export class ViewCounterScheduler {
	private readonly logger = new Logger(ViewCounterScheduler.name);

	constructor(private readonly viewCounterService: ViewCounterService) {}

	@Cron(VIEW_COUNTER_FLUSH_CRON)
	async flush(): Promise<void> {
		this.logger.log(
			`Running view counter flush to database (cron: ${VIEW_COUNTER_FLUSH_CRON})...`,
		);
		await this.viewCounterService.flushToDatabase();
	}
}
