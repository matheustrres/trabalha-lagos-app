import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	Patch,
	UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CompaniesService } from './companies.service';
import { CompanyResponseDto } from './dto/company-response.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

import {
	CurrentUser,
	type CurrentUserPayload,
} from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';

import { SwaggerRoute } from '@/shared/docs/swagger';

@ApiTags('companies')
@Controller('companies')
export class CompaniesController {
	constructor(private readonly companiesService: CompaniesService) {}

	// NOTE: /me must be declared before /:id to avoid NestJS matching "me" as a param
	@UseGuards(RolesGuard)
	@Roles('EMPLOYER')
	@Get('me')
	@SwaggerRoute({
		operation: 'Retornar a empresa do empregador autenticado',
		responses: [{ status: HttpStatus.OK, type: CompanyResponseDto }],
	})
	findMe(@CurrentUser() user: CurrentUserPayload): Promise<CompanyResponseDto> {
		return this.companiesService.findByUserId(user.userId);
	}

	@Public()
	@Get(':id')
	@SwaggerRoute({
		operation: 'Perfil público da empresa',
		responses: [{ status: HttpStatus.OK, type: CompanyResponseDto }],
		params: [{ name: 'id' }],
	})
	findById(@Param('id') id: string): Promise<CompanyResponseDto> {
		return this.companiesService.findById(id);
	}

	@UseGuards(RolesGuard)
	@Roles('EMPLOYER')
	@Patch(':id')
	@SwaggerRoute({
		operation: 'Atualizar perfil da empresa',
		responses: [{ status: HttpStatus.OK, type: CompanyResponseDto }],
		params: [{ name: 'id' }],
		body: UpdateCompanyDto,
	})
	update(
		@Param('id') id: string,
		@Body() dto: UpdateCompanyDto,
		@CurrentUser() user: CurrentUserPayload,
	): Promise<CompanyResponseDto | null> {
		return this.companiesService.update(id, user.userId, dto);
	}
}
