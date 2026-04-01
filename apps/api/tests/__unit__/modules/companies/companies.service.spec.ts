import {
	ConflictException,
	ForbiddenException,
	NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { type MockProxy } from 'vitest-mock-extended';

import { CompaniesRepository } from '@/modules/companies/companies.repository';
import { CompaniesService } from '@/modules/companies/companies.service';

import { aCompany } from '#/data/builders/company.builder';
import { makeCompaniesRepositoryMock } from '#/data/builders/repositories/companies.repository';

describe(CompaniesService.name, () => {
	let SUT: CompaniesService;
	let companiesRepository: MockProxy<CompaniesRepository>;

	beforeEach(() => {
		companiesRepository = makeCompaniesRepositoryMock();
		SUT = new CompaniesService(companiesRepository);
	});

	// ─── findById ──────────────────────────────────────────────────────────────

	describe('findById', () => {
		it('returns the company when found', async () => {
			const company = aCompany().buildWithUser();

			companiesRepository.findById.mockResolvedValue(company as any);

			const result = await SUT.findById(company.id);

			expect(result).toEqual(company);
			expect(companiesRepository.findById).toHaveBeenCalledWith(company.id);
		});

		it('throws NotFoundException when company does not exist', async () => {
			companiesRepository.findById.mockResolvedValue(null);

			await expect(SUT.findById('non-existent-id')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	// ─── findByUserId ─────────────────────────────────────────────────────────

	describe('findByUserId', () => {
		it('returns the company when found', async () => {
			const company = aCompany().withUserId('user-uuid-1').build();

			companiesRepository.findByUserId.mockResolvedValue(company);

			const result = await SUT.findByUserId('user-uuid-1');

			expect(result).toEqual(company);
			expect(companiesRepository.findByUserId).toHaveBeenCalledWith(
				'user-uuid-1',
			);
		});

		it('throws NotFoundException when user has no company', async () => {
			companiesRepository.findByUserId.mockResolvedValue(null);

			await expect(SUT.findByUserId('user-uuid-1')).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	// ─── create ────────────────────────────────────────────────────────────────

	describe('create', () => {
		it('creates a new company when user has none', async () => {
			const company = aCompany().withUserId('user-uuid-1').build();
			const dto = {
				name: 'Nova Empresa',
				document: '11222333000181',
				city: 'Cabo Frio',
				whatsapp: '22999999999',
			};

			companiesRepository.findByUserId.mockResolvedValue(null);
			companiesRepository.create.mockResolvedValue(company);

			const result = await SUT.create('user-uuid-1', dto);

			expect(result).toEqual(company);
			expect(companiesRepository.create).toHaveBeenCalledWith({
				userId: 'user-uuid-1',
				name: dto.name,
				document: dto.document,
				city: dto.city,
				whatsapp: dto.whatsapp,
			});
		});

		it('throws ConflictException when user already has a company', async () => {
			const existingCompany = aCompany().withUserId('user-uuid-1').build();
			const dto = {
				name: 'Nova Empresa',
				document: '11222333000181',
				city: 'Cabo Frio',
				whatsapp: '22999999999',
			};

			companiesRepository.findByUserId.mockResolvedValue(existingCompany);

			await expect(SUT.create('user-uuid-1', dto)).rejects.toThrow(
				ConflictException,
			);
		});
	});

	// ─── update ────────────────────────────────────────────────────────────────

	describe('update', () => {
		it('updates the company when user is the owner', async () => {
			const company = aCompany().withUserId('user-uuid-1').build();
			const dto = { name: 'Nome Atualizado', segment: 'Novo Segmento' };
			const updatedCompany = { ...company, ...dto };

			companiesRepository.findById.mockResolvedValue(company as any);
			companiesRepository.update.mockResolvedValue(updatedCompany as any);

			const result = await SUT.update(company.id, 'user-uuid-1', dto);

			expect(result).toEqual(updatedCompany);
			expect(companiesRepository.update).toHaveBeenCalledWith(company.id, dto);
		});

		it('throws NotFoundException when company does not exist', async () => {
			companiesRepository.findById.mockResolvedValue(null);

			await expect(
				SUT.update('non-existent-id', 'user-uuid-1', { name: 'Test' }),
			).rejects.toThrow(NotFoundException);
		});

		it('throws ForbiddenException when user is not the owner', async () => {
			const company = aCompany().withUserId('user-uuid-1').build();

			companiesRepository.findById.mockResolvedValue(company as any);

			await expect(
				SUT.update(company.id, 'other-user-id', { name: 'Test' }),
			).rejects.toThrow(ForbiddenException);
		});
	});
});
