import { Inject, Injectable, Logger, forwardRef } from '@nestjs/common';
import Redis from 'ioredis';
import { isbot } from 'isbot';

import { JobsRepository } from '../jobs.repository';

import { REDIS_TOKEN } from '@/shared/modules/redis/redis.provider';

const DEDUP_PREFIX = 'tl:views';
const COUNT_PREFIX = 'tl:views:count';
const DEDUP_TTL = 3600; // 1 hour

@Injectable()
export class ViewCounterService {
	private readonly logger = new Logger(ViewCounterService.name);

	constructor(
		@Inject(REDIS_TOKEN) private readonly redis: Redis,
		@Inject(forwardRef(() => JobsRepository))
		private readonly jobsRepository: JobsRepository,
	) {}

	private async scanKeys(pattern: string): Promise<string[]> {
		const keys: string[] = [];
		let cursor = '0';
		do {
			const [nextCursor, foundKeys] = await this.redis.scan(
				cursor,
				'MATCH',
				pattern,
				'COUNT',
				100,
			);
			cursor = nextCursor;
			keys.push(...foundKeys);
		} while (cursor !== '0');
		return keys;
	}

	async increment(jobId: string, ip: string, userAgent: string): Promise<void> {
		if (isbot(userAgent)) {
			return;
		}

		// Deduplication key: tl:views:{jobId}:{ip}
		const dedupKey = `${DEDUP_PREFIX}:${jobId}:${ip}`;

		const exists = await this.redis.exists(dedupKey);
		if (exists) {
			return;
		}

		// Set dedup key with 1 hour TTL
		await this.redis.setex(dedupKey, DEDUP_TTL, '1');

		// Increment the view count: tl:views:count:{jobId}
		const countKey = `${COUNT_PREFIX}:${jobId}`;
		await this.redis.incr(countKey);
	}

	async flushToDatabase(): Promise<void> {
		// Find all jobs with pending view counts
		const keys = await this.scanKeys(`${COUNT_PREFIX}:*`);
		if (keys.length === 0) {
			return;
		}

		for (const countKey of keys) {
			const jobId = countKey.replace(`${COUNT_PREFIX}:`, '');
			const countStr = await this.redis.get(countKey);

			if (!countStr) {
				continue;
			}

			const count = parseInt(countStr, 10);
			if (isNaN(count) || count === 0) {
				continue;
			}

			// Update database: viewCount = viewCount + count
			await this.jobsRepository.incrementViewCount(jobId, count);
			await this.redis.del(countKey);

			// Delete all dedup keys for this job: tl:views:{jobId}:*
			const dedupKeys = await this.scanKeys(`${DEDUP_PREFIX}:${jobId}:*`);
			if (dedupKeys.length > 0) {
				await this.redis.del(...dedupKeys);
			}

			this.logger.log(`Flushed ${count} views for job ${jobId}`);
		}
	}
}
