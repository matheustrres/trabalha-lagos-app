import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Patch,
	Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

import {
	CurrentUser,
	type CurrentUserPayload,
} from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

import { SwaggerRoute } from '@/shared/docs/swagger';
import { getUserTracker } from '@/shared/utils/get-user-tracker';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('register')
	@Throttle({
		medium: { limit: 3, ttl: 60000 },
	})
	@SwaggerRoute({
		operation: 'Registrar novo usuário',
		responses: [{ status: HttpStatus.CREATED, type: AuthResponseDto }],
	})
	async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
		return this.authService.register(dto);
	}

	@Public()
	@Post('login')
	@Throttle({
		medium: { limit: 5, ttl: 60000 },
	})
	@HttpCode(HttpStatus.OK)
	@SwaggerRoute({
		operation: 'Autenticar usuário',
		responses: [{ status: HttpStatus.OK, type: AuthResponseDto }],
	})
	async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
		return this.authService.login(dto);
	}

	@Public()
	@Post('refresh')
	@Throttle({
		medium: { limit: 20, ttl: 60000 },
	})
	@HttpCode(HttpStatus.OK)
	@SwaggerRoute({
		operation: 'Renovar par de tokens',
		responses: [{ status: HttpStatus.OK, type: AuthResponseDto }],
	})
	async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
		return this.authService.refresh(dto.refreshToken);
	}

	@Patch('password')
	@Throttle({ medium: { limit: 5, ttl: 60000, getTracker: getUserTracker } })
	@SwaggerRoute({
		operation:
			'Alterar senha do usuário autenticado e invalidar outros refresh tokens',
		responses: [{ status: HttpStatus.OK, type: AuthResponseDto }],
		body: UpdatePasswordDto,
		authName: 'jwt',
	})
	async updatePassword(
		@CurrentUser() user: CurrentUserPayload,
		@Body() dto: UpdatePasswordDto,
	): Promise<AuthResponseDto> {
		return this.authService.updatePassword(
			user.userId,
			dto.currentPassword,
			dto.newPassword,
		);
	}
}
