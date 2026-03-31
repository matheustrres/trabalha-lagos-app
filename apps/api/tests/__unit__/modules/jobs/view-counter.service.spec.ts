import Redis from 'ioredis';
import { isbot } from 'isbot';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type MockProxy } from 'vitest-mock-extended';

import { JobsRepository } from '@/modules/jobs/jobs.repository';
import { ViewCounterService } from '@/modules/jobs/services/view-counter.service';

import { makeJobsRepositoryMock } from '#/data/mocks/jobs.repository.mock';
import { makeRedisServiceMock } from '#/data/mocks/redis.service.mock';

vi.mock('isbot', () => ({
	isbot: vi.fn(),
}));

describe(ViewCounterService.name, () => {
	let SUT: ViewCounterService;
	let redis: MockProxy<Redis>;
	let jobsRepository: MockProxy<JobsRepository>;

	beforeEach(() => {
		vi.clearAllMocks();
		redis = makeRedisServiceMock();
		jobsRepository = makeJobsRepositoryMock();
		SUT = new ViewCounterService(redis, jobsRepository);
	});

	// ─── increment ───────────────────────────────────────────────────────────────

	describe('increment', () => {
		it('does not increment when userAgent is bot (isbot returns true)', async () => {
			vi.mocked(isbot).mockReturnValue(true);

			await SUT.increment('job-123', '192.168.1.1', 'Bot/1.0');

			expect(isbot).toHaveBeenCalledWith('Bot/1.0');
			expect(redis.setex).not.toHaveBeenCalled();
			expect(redis.incr).not.toHaveBeenCalled();
		});

		it('does not increment when IP already registered view in the last hour', async () => {
			vi.mocked(isbot).mockReturnValue(false);
			redis.exists.mockResolvedValue(1);

			await SUT.increment('job-123', '192.168.1.1', 'Mozilla/5.0');

			expect(redis.exists).toHaveBeenCalledWith('tl:views:job-123:192.168.1.1');
			expect(redis.setex).not.toHaveBeenCalled();
			expect(redis.incr).not.toHaveBeenCalled();
		});

		it('increments correctly when IP is new', async () => {
			vi.mocked(isbot).mockReturnValue(false);
			redis.exists.mockResolvedValue(0);

			await SUT.increment('job-123', '192.168.1.1', 'Mozilla/5.0');

			expect(redis.setex).toHaveBeenCalledWith(
				'tl:views:job-123:192.168.1.1',
				3600,
				'1',
			);
			expect(redis.incr).toHaveBeenCalledWith('tl:views:count:job-123');
		});

		it('creates dedup key with correct TTL', async () => {
			vi.mocked(isbot).mockReturnValue(false);
			redis.exists.mockResolvedValue(0);

			await SUT.increment('job-456', '10.0.0.1', 'Chrome/120.0');

			expect(redis.setex).toHaveBeenCalledWith(
				'tl:views:job-456:10.0.0.1',
				3600,
				'1',
			);
		});
	});

	// ─── flushToDatabase ───────────────────────────────────────────────────────

	describe('flushToDatabase', () => {
		it('does nothing when there are no count keys', async () => {
			redis.scan.mockResolvedValue(['0', []]);

			await SUT.flushToDatabase();

			expect(redis.scan).toHaveBeenCalledWith(
				'0',
				'MATCH',
				'tl:views:count:*',
				'COUNT',
				100,
			);
			expect(jobsRepository.incrementViewCount).not.toHaveBeenCalled();
		});

		it('updates viewCount in database correctly', async () => {
			redis.scan.mockResolvedValue(['0', ['tl:views:count:job-123']]);
			redis.get.mockResolvedValue('5');

			await SUT.flushToDatabase();

			expect(jobsRepository.incrementViewCount).toHaveBeenCalledWith(
				'job-123',
				5,
			);
		});

		it('deletes keys from Redis after flush', async () => {
			redis.scan
				.mockResolvedValueOnce(['0', ['tl:views:count:job-123']])
				.mockResolvedValueOnce(['0', ['tl:views:job-123:192.168.1.1']]);
			redis.get.mockResolvedValue('3');

			await SUT.flushToDatabase();

			expect(redis.del).toHaveBeenCalledWith('tl:views:count:job-123');
			expect(redis.del).toHaveBeenCalledWith('tl:views:job-123:192.168.1.1');
		});

		it('flushes multiple jobs correctly', async () => {
			redis.scan
				.mockResolvedValueOnce([
					'0',
					['tl:views:count:job-1', 'tl:views:count:job-2'],
				])
				.mockResolvedValueOnce(['0', []])
				.mockResolvedValueOnce(['0', []]);
			redis.get.mockResolvedValueOnce('10').mockResolvedValueOnce('20');

			await SUT.flushToDatabase();

			expect(jobsRepository.incrementViewCount).toHaveBeenCalledTimes(2);
			expect(jobsRepository.incrementViewCount).toHaveBeenCalledWith(
				'job-1',
				10,
			);
			expect(jobsRepository.incrementViewCount).toHaveBeenCalledWith(
				'job-2',
				20,
			);
		});

		it('skips keys with invalid or zero count', async () => {
			redis.scan.mockResolvedValueOnce([
				'0',
				['tl:views:count:job-invalid', 'tl:views:count:job-zero'],
			]);
			redis.get.mockResolvedValueOnce('invalid').mockResolvedValueOnce('0');

			await SUT.flushToDatabase();

			expect(jobsRepository.incrementViewCount).not.toHaveBeenCalled();
		});
	});
});
