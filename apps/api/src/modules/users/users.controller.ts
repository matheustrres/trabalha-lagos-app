import {
	Body,
	Controller,
	Get,
	Delete,
	HttpStatus,
	HttpCode,
	Patch,
	UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AccountResponseDto } from './dto/account-response.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { UpdateEmailDto } from './dto/update-email.dto';
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
import { getUserTracker } from '@/shared/utils/get-user-tracker';

@ApiTags('users')
@Controller('users')
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get('me')
	@SwaggerRoute({
		operation: 'Retornar dados da conta do usuário autenticado',
		responses: [{ status: HttpStatus.OK, type: AccountResponseDto }],
		authName: 'jwt',
	})
	async getMyAccount(@CurrentUser() user: CurrentUserPayload) {
		const account = await this.usersService.findByIdOrFail(user.userId);
		return this.serializeAccount(account);
	}

	@Patch('me')
	@Throttle({ medium: { limit: 20, ttl: 60000, getTracker: getUserTracker } })
	@SwaggerRoute({
		operation: 'Atualizar nome e cidade da conta do usuário autenticado',
		responses: [{ status: HttpStatus.OK, type: AccountResponseDto }],
		authName: 'jwt',
		body: UpdateAccountDto,
	})
	async updateMyAccount(
		@CurrentUser() user: CurrentUserPayload,
		@Body() dto: UpdateAccountDto,
	) {
		return this.serializeAccount(
			await this.usersService.updateAccount(user.userId, dto),
		);
	}

	@Patch('me/email')
	@Throttle({ medium: { limit: 5, ttl: 60000, getTracker: getUserTracker } })
	@SwaggerRoute({
		operation: 'Alterar e-mail da conta após confirmação da senha atual',
		responses: [{ status: HttpStatus.OK, type: AccountResponseDto }],
		authName: 'jwt',
		body: UpdateEmailDto,
	})
	async updateMyEmail(
		@CurrentUser() user: CurrentUserPayload,
		@Body() dto: UpdateEmailDto,
	) {
		return this.serializeAccount(
			await this.usersService.updateEmail(
				user.userId,
				dto.email,
				dto.currentPassword,
			),
		);
	}

	@Delete('me')
	@Throttle({ medium: { limit: 3, ttl: 60000, getTracker: getUserTracker } })
	@SwaggerRoute({
		operation: 'Excluir permanentemente a conta do usuário autenticado',
		responses: [{ status: HttpStatus.NO_CONTENT }],
		authName: 'jwt',
		body: DeleteAccountDto,
	})
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteMyAccount(
		@CurrentUser() user: CurrentUserPayload,
		@Body() dto: DeleteAccountDto,
	): Promise<void> {
		await this.usersService.deleteAccount(user.userId, dto.currentPassword);
	}

	@UseGuards(RolesGuard)
	@Roles('CANDIDATE')
	@Get('me/profile')
	@Throttle({
		medium: {
			limit: 120,
			ttl: 60000,
			getTracker: getUserTracker,
		},
	})
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
	@Throttle({
		medium: {
			limit: 20,
			ttl: 60000,
			getTracker: getUserTracker,
		},
	})
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

	private serializeAccount(user: UserSchema): AccountResponseDto {
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			city: user.city,
			role: user.role,
		};
	}
}
