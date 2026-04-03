import { NotFoundException } from '@nestjs/common';
import type { Request } from 'express';
import { beforeEach, describe, expect, it } from 'vitest';
import { mock, type MockProxy } from 'vitest-mock-extended';

import { type CurrentUserPayload } from '@/common/decorators/current-user.decorator';

import { JobsController } from '@/modules/jobs/jobs.controller';
import { JobsService } from '@/modules/jobs/jobs.service';

describe(JobsController.name, () => {
	let SUT: JobsController;
	let jobsService: MockProxy<JobsService>;

	beforeEach(() => {
		jobsService = mock<JobsService>();
		SUT = new JobsController(jobsService);
	});

	it('delegates search query to service', async () => {
		const query = { page: 1, limit: 20, radius: 20, sort: 'recent' } as any;
		const response = { data: [], meta: { total: 0, page: 1, limit: 20 } };
		jobsService.search.mockResolvedValue(response as never);

		const result = await SUT.search(query);

		expect(jobsService.search).toHaveBeenCalledWith(query);
		expect(result).toEqual(response);
	});

	it('delegates findMyJobs with authenticated user id', async () => {
		const user: CurrentUserPayload = {
			userId: 'user-uuid-1',
			role: 'EMPLOYER',
		};
		jobsService.findByCompany.mockResolvedValue([] as never);

		await SUT.findMyJobs(user);

		expect(jobsService.findByCompany).toHaveBeenCalledWith('user-uuid-1');
	});

	it('extracts ip and user-agent on findBySlug', async () => {
		const req = {
			headers: {
				'x-forwarded-for': '203.0.113.10, 10.0.0.1',
				'user-agent': 'Mozilla Test',
			},
			ip: '127.0.0.1',
		} as unknown as Request;

		jobsService.findBySlug.mockResolvedValue({ id: 'job-uuid-1' } as never);

		await SUT.findBySlug('atendente-de-turismo', req);

		expect(jobsService.findBySlug).toHaveBeenCalledWith(
			'atendente-de-turismo',
			'203.0.113.10',
			'Mozilla Test',
		);
	});

	it('delegates create with user id and dto', async () => {
		const user: CurrentUserPayload = {
			userId: 'user-uuid-1',
			role: 'EMPLOYER',
		};
		const dto = { title: 'Atendente', city: 'Cabo Frio' } as any;
		jobsService.create.mockResolvedValue({ id: 'job-uuid-1' } as never);

		await SUT.create(dto, user);

		expect(jobsService.create).toHaveBeenCalledWith('user-uuid-1', dto);
	});

	it('delegates update and updateStatus with authenticated user id', async () => {
		const user: CurrentUserPayload = {
			userId: 'user-uuid-1',
			role: 'EMPLOYER',
		};
		jobsService.update.mockResolvedValue({ id: 'job-uuid-1' } as never);
		jobsService.updateStatus.mockResolvedValue({ id: 'job-uuid-1' } as never);

		await SUT.update('job-uuid-1', { title: 'Novo' } as any, user);
		await SUT.updateStatus('job-uuid-1', { status: 'CLOSED' }, user);

		expect(jobsService.update).toHaveBeenCalledWith(
			'job-uuid-1',
			'user-uuid-1',
			{
				title: 'Novo',
			},
		);
		expect(jobsService.updateStatus).toHaveBeenCalledWith(
			'job-uuid-1',
			'user-uuid-1',
			'CLOSED',
		);
	});

	it('propagates service errors', async () => {
		jobsService.findBySlug.mockRejectedValue(
			new NotFoundException('Vaga não encontrada.'),
		);

		await expect(
			SUT.findBySlug('slug-invalido', {
				headers: {},
				ip: '',
			} as unknown as Request),
		).rejects.toThrow(NotFoundException);
	});
});
