import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { mock, type MockProxy } from 'vitest-mock-extended';

import { type CurrentUserPayload } from '@/common/decorators/current-user.decorator';

import { InterestsController } from '@/modules/interests/interests.controller';
import { InterestsService } from '@/modules/interests/interests.service';

describe(InterestsController.name, () => {
	let SUT: InterestsController;
	let interestsService: MockProxy<InterestsService>;

	beforeEach(() => {
		interestsService = mock<InterestsService>();
		SUT = new InterestsController(interestsService);
	});

	describe('create', () => {
		it('delegates create with optional authenticated user id', async () => {
			const dto = {
				name: 'João Candidate',
				phone: '22999990005',
				city: 'Cabo Frio',
			};
			const user: CurrentUserPayload = {
				userId: 'user-uuid-1',
				role: 'CANDIDATE',
			};
			const interest = {
				id: 'interest-uuid-1',
				jobId: 'job-uuid-1',
				...dto,
				status: 'SENT',
				userId: 'user-uuid-1',
				createdAt: new Date(),
			};

			interestsService.create.mockResolvedValue(interest as never);

			const result = await SUT.create('job-uuid-1', dto, user);

			expect(interestsService.create).toHaveBeenCalledWith(
				'job-uuid-1',
				dto,
				'user-uuid-1',
			);
			expect(result).toEqual(interest);
		});
	});

	describe('findMyInterests', () => {
		it('delegates query filters using employer user id', async () => {
			const user: CurrentUserPayload = {
				userId: 'employer-uuid-1',
				role: 'EMPLOYER',
			};
			const query = { status: 'SENT' as const, jobId: 'job-uuid-1' };
			const response = {
				data: [],
				meta: { total: 0, plan: 'FREE', phoneRestricted: true },
			};

			interestsService.findByCompany.mockResolvedValue(response as never);

			const result = await SUT.findMyInterests(user, query);

			expect(interestsService.findByCompany).toHaveBeenCalledWith(
				'employer-uuid-1',
				query,
			);
			expect(result).toEqual(response);
		});
	});

	describe('updateStatus', () => {
		it('delegates update with interest id, user id and dto', async () => {
			const user: CurrentUserPayload = {
				userId: 'employer-uuid-1',
				role: 'EMPLOYER',
			};
			const dto = { status: 'CONTACTED' as const };
			const updated = {
				id: 'interest-uuid-1',
				jobId: 'job-uuid-1',
				name: 'João Candidate',
				phone: '22999990005',
				city: 'Cabo Frio',
				status: 'CONTACTED',
				userId: null,
				createdAt: new Date(),
			};

			interestsService.updateStatus.mockResolvedValue(updated as never);

			const result = await SUT.updateStatus('interest-uuid-1', dto, user);

			expect(interestsService.updateStatus).toHaveBeenCalledWith(
				'interest-uuid-1',
				'employer-uuid-1',
				dto,
			);
			expect(result).toEqual(updated);
		});

		it('propagates service errors', async () => {
			const user: CurrentUserPayload = {
				userId: 'employer-uuid-1',
				role: 'EMPLOYER',
			};

			interestsService.updateStatus.mockRejectedValue(
				new NotFoundException('Interesse não encontrado.'),
			);

			await expect(
				SUT.updateStatus('invalid-id', { status: 'VIEWED' }, user),
			).rejects.toThrow(NotFoundException);
		});
	});
});
