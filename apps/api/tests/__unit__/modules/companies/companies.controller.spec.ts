import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { mock, type MockProxy } from 'vitest-mock-extended';

import { type CurrentUserPayload } from '@/common/decorators/current-user.decorator';

import { CompaniesController } from '@/modules/companies/companies.controller';
import { CompaniesService } from '@/modules/companies/companies.service';

import { aCompany } from '#/data/builders/company.builder';

describe(CompaniesController.name, () => {
	let SUT: CompaniesController;
	let companiesService: MockProxy<CompaniesService>;

	beforeEach(() => {
		companiesService = mock<CompaniesService>();
		SUT = new CompaniesController(companiesService);
	});

	describe('findMe', () => {
		it('delegates to companiesService.findByUserId with authenticated user id', async () => {
			const user: CurrentUserPayload = {
				userId: 'user-uuid-1',
				role: 'EMPLOYER',
			};
			const company = aCompany().withUserId('user-uuid-1').build();

			companiesService.findByUserId.mockResolvedValue(company as never);

			const result = await SUT.findMe(user);

			expect(companiesService.findByUserId).toHaveBeenCalledWith('user-uuid-1');
			expect(result).toEqual(company);
		});
	});

	describe('findById', () => {
		it('delegates to companiesService.findById and returns company profile', async () => {
			const company = aCompany().buildWithUser();
			companiesService.findById.mockResolvedValue(company as never);

			const result = await SUT.findById(company.id);

			expect(companiesService.findById).toHaveBeenCalledWith(company.id);
			expect(result).toEqual(company);
		});

		it('propagates service errors', async () => {
			companiesService.findById.mockRejectedValue(
				new NotFoundException('Empresa não encontrada.'),
			);

			await expect(SUT.findById('non-existent-id')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('update', () => {
		it('delegates update with id, dto and authenticated user id', async () => {
			const user: CurrentUserPayload = {
				userId: 'user-uuid-1',
				role: 'EMPLOYER',
			};
			const dto = {
				name: 'Empresa Atualizada',
				segment: 'Turismo',
			};
			const updated = {
				...aCompany().withUserId('user-uuid-1').build(),
				...dto,
			};

			companiesService.update.mockResolvedValue(updated as never);

			const result = await SUT.update('company-uuid-1', dto, user);

			expect(companiesService.update).toHaveBeenCalledWith(
				'company-uuid-1',
				'user-uuid-1',
				dto,
			);
			expect(result).toEqual(updated);
		});
	});
});
