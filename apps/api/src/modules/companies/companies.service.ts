import {
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';

import { CompaniesRepository } from './companies.repository';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
	constructor(private readonly companiesRepository: CompaniesRepository) {}

	async findById(id: string) {
		const company = await this.companiesRepository.findById(id);
		if (!company) throw new NotFoundException('Empresa não encontrada.');
		return company;
	}

	async findByUserId(userId: string) {
		const company = await this.companiesRepository.findByUserId(userId);
		if (!company) throw new NotFoundException('Empresa não encontrada.');
		return company;
	}

	async create(userId: string, dto: CreateCompanyDto) {
		const existing = await this.companiesRepository.findByUserId(userId);
		if (existing)
			throw new ConflictException('Usuário já possui uma empresa cadastrada.');

		return this.companiesRepository.create({
			userId,
			name: dto.name,
			city: dto.city,
			whatsapp: dto.whatsapp,
		});
	}

	async update(id: string, userId: string, dto: UpdateCompanyDto) {
		const company = await this.companiesRepository.findById(id);
		if (!company) throw new NotFoundException('Empresa não encontrada.');
		if (company.userId !== userId)
			throw new ForbiddenException('Acesso negado.');

		return this.companiesRepository.update(id, dto);
	}
}
