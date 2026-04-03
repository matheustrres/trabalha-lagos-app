import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Patch,
	UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { UsersService } from './users.service';

import {
	CurrentUser,
	type CurrentUserPayload,
} from '@/common/decorators/current-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';

import { SwaggerRoute } from '@/shared/docs/swagger';
import { UserSchema } from '@/shared/modules/database/schema';

@ApiTags('users')
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@UseGuards(RolesGuard)
	@Roles('CANDIDATE')
	@Get('me/profile')
	@SwaggerRoute({
		operation: 'Retornar mini-perfil do candidato autenticado',
		responses: [{ status: HttpStatus.OK, type: UserProfileResponseDto }],
		authName: 'jwt',
	})
	async getMyProfile(@CurrentUser() user: CurrentUserPayload) {
		const profile = await this.usersService.findByIdOrFail(user.userId);
		return this.serializeProfile(profile);
	}

	@UseGuards(RolesGuard)
	@Roles('CANDIDATE')
	@Patch('me/profile')
	@SwaggerRoute({
		operation: 'Atualizar mini-perfil do candidato autenticado',
		responses: [{ status: HttpStatus.OK, type: UserProfileResponseDto }],
		authName: 'jwt',
		body: UpdateUserProfileDto,
	})
	async updateMyProfile(
		@CurrentUser() user: CurrentUserPayload,
		@Body() dto: UpdateUserProfileDto,
	) {
		const profile = await this.usersService.updateProfile(user.userId, dto);
		return this.serializeProfile(profile);
	}

	private serializeProfile(user: UserSchema): UserProfileResponseDto {
		return {
			id: user.id,
			name: user.name,
			phone: user.phone,
			city: user.city,
			interests: user.interests,
			experience: user.experience,
			availability: user.availability,
			acceptedContractTypes: user.acceptedContractTypes,
			neighborhood: user.neighborhood,
		};
	}
}
