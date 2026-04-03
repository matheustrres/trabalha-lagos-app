import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateInterestDto } from './dto/create-interest.dto';
import {
	InterestResponseDto,
	InterestsListResponseDto,
} from './dto/interest-response.dto';
import { QueryInterestsDto } from './dto/query-interests.dto';
import { UpdateInterestStatusDto } from './dto/update-interest-status.dto';
import { InterestsService } from './interests.service';

import {
	CurrentUser,
	type CurrentUserPayload,
} from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { OptionalJwtAuthGuard } from '@/common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

import { SwaggerRoute } from '@/shared/docs/swagger';

@ApiTags('interests')
@Controller()
export class InterestsController {
	constructor(private readonly interestsService: InterestsService) {}

	@Public()
	@UseGuards(OptionalJwtAuthGuard)
	@Post('jobs/:jobId/interest')
	@SwaggerRoute({
		operation: 'Demonstrar interesse em uma vaga (público)',
		responses: [{ status: HttpStatus.CREATED, type: InterestResponseDto }],
		params: [{ name: 'jobId' }],
		body: CreateInterestDto,
	})
	async create(
		@Param('jobId') jobId: string,
		@Body() dto: CreateInterestDto,
		@CurrentUser() user: CurrentUserPayload | null,
	) {
		return this.interestsService.create(jobId, dto, user?.userId);
	}

	@UseGuards(RolesGuard)
	@Roles('EMPLOYER')
	@Get('employer/interests')
	@SwaggerRoute({
		operation: 'Listar interesses recebidos nas vagas da empresa',
		responses: [{ status: HttpStatus.OK, type: InterestsListResponseDto }],
		authName: 'jwt',
		queries: [
			{ name: 'status', required: false },
			{ name: 'jobId', required: false },
			{ name: 'availability', required: false },
			{ name: 'area', required: false },
		],
	})
	async findMyInterests(
		@CurrentUser() user: CurrentUserPayload,
		@Query() query: QueryInterestsDto,
	) {
		return this.interestsService.findByCompany(user.userId, query);
	}

	@UseGuards(RolesGuard)
	@Roles('EMPLOYER')
	@Patch('interests/:id/status')
	@SwaggerRoute({
		operation: 'Atualizar status de um interesse (apenas o dono da vaga)',
		responses: [{ status: HttpStatus.OK, type: InterestResponseDto }],
		authName: 'jwt',
		params: [{ name: 'id' }],
		body: UpdateInterestStatusDto,
	})
	async updateStatus(
		@Param('id') id: string,
		@Body() dto: UpdateInterestStatusDto,
		@CurrentUser() user: CurrentUserPayload,
	) {
		return this.interestsService.updateStatus(id, user.userId, dto);
	}
}
