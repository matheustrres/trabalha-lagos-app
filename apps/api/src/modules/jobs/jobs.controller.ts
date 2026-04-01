import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query,
	Req,
	UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { CreateJobDto } from './dto/create-job.dto';
import { JobResponseDto } from './dto/job-response.dto';
import { QueryJobsDto } from './dto/query-jobs.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsService } from './jobs.service';

import {
	CurrentUser,
	type CurrentUserPayload,
} from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';

import { SwaggerRoute } from '@/shared/docs/swagger';

@ApiTags('jobs')
@Controller()
export class JobsController {
	constructor(private readonly jobsService: JobsService) {}

	@Public()
	@Get('jobs')
	@SwaggerRoute({
		operation: 'Buscar vagas com filtros e geolocalização',
		responses: [{ status: HttpStatus.OK, type: [JobResponseDto] }],
		queries: [
			{ name: 'lat', required: false },
			{ name: 'lng', required: false },
			{ name: 'radius', required: false },
			{ name: 'category', required: false },
			{ name: 'contractType', required: false },
			{ name: 'city', required: false },
			{ name: 'q', required: false },
			{ name: 'page', required: false },
			{ name: 'limit', required: false },
			{ name: 'sort', required: false },
		],
	})
	async search(@Query() query: QueryJobsDto) {
		return this.jobsService.search(query);
	}

	@UseGuards(RolesGuard)
	@Roles('EMPLOYER')
	@Get('employer/jobs')
	@SwaggerRoute({
		operation: 'Listar vagas da empresa do empregador autenticado',
		responses: [{ status: HttpStatus.OK, type: [JobResponseDto] }],
		authName: 'jwt',
	})
	async findMyJobs(@CurrentUser() user: CurrentUserPayload) {
		return this.jobsService.findByCompany(user.userId);
	}

	@Public()
	@Get('jobs/:slug')
	@SwaggerRoute({
		operation: 'Detalhe da vaga por slug',
		responses: [{ status: HttpStatus.OK, type: JobResponseDto }],
		params: [{ name: 'slug' }],
	})
	async findBySlug(@Param('slug') slug: string, @Req() req: Request) {
		const ip =
			req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() ||
			req.ip ||
			'';
		const userAgent = req.headers['user-agent'] || '';
		return this.jobsService.findBySlug(slug, ip, userAgent);
	}

	@UseGuards(RolesGuard)
	@Roles('EMPLOYER')
	@Post('jobs')
	@SwaggerRoute({
		operation: 'Criar nova vaga',
		responses: [{ status: HttpStatus.CREATED, type: JobResponseDto }],
		authName: 'jwt',
		body: CreateJobDto,
	})
	async create(
		@Body() dto: CreateJobDto,
		@CurrentUser() user: CurrentUserPayload,
	) {
		return this.jobsService.create(user.userId, dto);
	}

	@UseGuards(RolesGuard)
	@Roles('EMPLOYER')
	@Patch('jobs/:id')
	@SwaggerRoute({
		operation: 'Editar vaga (apenas o dono)',
		responses: [{ status: HttpStatus.OK, type: JobResponseDto }],
		authName: 'jwt',
		params: [{ name: 'id' }],
		body: UpdateJobDto,
	})
	async update(
		@Param('id') id: string,
		@Body() dto: UpdateJobDto,
		@CurrentUser() user: CurrentUserPayload,
	) {
		return this.jobsService.update(id, user.userId, dto);
	}

	@UseGuards(RolesGuard)
	@Roles('EMPLOYER')
	@Patch('jobs/:id/status')
	@SwaggerRoute({
		operation: 'Alterar status da vaga (apenas o dono)',
		responses: [{ status: HttpStatus.OK, type: JobResponseDto }],
		authName: 'jwt',
		params: [{ name: 'id' }],
		body: UpdateJobStatusDto,
	})
	async updateStatus(
		@Param('id') id: string,
		@Body() dto: UpdateJobStatusDto,
		@CurrentUser() user: CurrentUserPayload,
	) {
		return this.jobsService.updateStatus(id, user.userId, dto.status);
	}
}
