import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';

import { Public } from '@/common/decorators/public.decorator';

import { SwaggerRoute } from '@/shared/docs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Public()
	@Post('register')
	@SwaggerRoute({
		operation: 'Registrar novo usuário',
		responses: [{ status: HttpStatus.CREATED, type: AuthResponseDto }],
	})
	async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
		return this.authService.register(dto);
	}

	@Public()
	@Post('login')
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
	@HttpCode(HttpStatus.OK)
	@SwaggerRoute({
		operation: 'Renovar par de tokens',
		responses: [{ status: HttpStatus.OK, type: AuthResponseDto }],
	})
	async refresh(
		@Body() dto: RefreshTokenDto,
	): Promise<{ accessToken: string; refreshToken: string }> {
		return this.authService.refresh(dto.refreshToken);
	}
}
