import {
	ConflictException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import { UsersService } from '@/modules/users/users.service';

import { EnvService } from '@/shared/modules/env/env.service';

type TokenPair = {
	accessToken: string;
	refreshToken: string;
};

type AuthResult = TokenPair & {
	user: {
		id: string;
		name: string;
		phone: string;
		role: string;
	};
};

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly envService: EnvService,
	) {}

	async register(dto: RegisterDto): Promise<AuthResult> {
		const existingUser = await this.usersService.findByPhone(dto.phone);

		if (existingUser) {
			throw new ConflictException('Telefone já cadastrado.');
		}

		const passwordHash = await argon2.hash(dto.password);

		const user = await this.usersService.create({
			name: dto.name,
			phone: dto.phone,
			email: dto.email,
			passwordHash,
			city: dto.city,
			role: dto.role,
		});

		const tokens = await this.generateTokens(user.id, user.role);

		return {
			...tokens,
			user: {
				id: user.id,
				name: user.name,
				phone: user.phone,
				role: user.role,
			},
		};
	}

	async login(dto: LoginDto): Promise<AuthResult> {
		const user = await this.usersService.findByPhone(dto.phone);

		if (!user) {
			throw new UnauthorizedException('Credenciais inválidas.');
		}

		const isPasswordValid = await argon2.verify(
			user.passwordHash,
			dto.password,
		);

		if (!isPasswordValid) {
			throw new UnauthorizedException('Credenciais inválidas.');
		}

		const tokens = await this.generateTokens(user.id, user.role);

		return {
			...tokens,
			user: {
				id: user.id,
				name: user.name,
				phone: user.phone,
				role: user.role,
			},
		};
	}

	async refresh(refreshToken: string): Promise<TokenPair> {
		let payload: { sub: string; role: string };

		try {
			payload = this.jwtService.verify<{ sub: string; role: string }>(
				refreshToken,
				{
					secret: this.envService.getKeyOrThrow('JWT_REFRESH_SECRET'),
				},
			);
		} catch {
			throw new UnauthorizedException('Refresh token inválido ou expirado.');
		}

		const user = await this.usersService.findById(payload.sub);

		if (!user) {
			throw new UnauthorizedException('Usuário não encontrado.');
		}

		return this.generateTokens(user.id, user.role);
	}

	private async generateTokens(
		userId: string,
		role: string,
	): Promise<TokenPair> {
		const payload = { sub: userId, role };

		// expiresIn cast required: @nestjs/jwt v11 uses ms@3 StringValue branded type,
		// but jsonwebtoken accepts plain strings like '15m' at runtime.
		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(payload, {
				secret: this.envService.getKeyOrThrow('JWT_SECRET'),
				expiresIn: this.envService.getKeyOrThrow(
					'JWT_EXPIRES_IN',
				) as unknown as number,
			}),
			this.jwtService.signAsync(payload, {
				secret: this.envService.getKeyOrThrow('JWT_REFRESH_SECRET'),
				expiresIn: this.envService.getKeyOrThrow(
					'JWT_REFRESH_EXPIRES_IN',
				) as unknown as number,
			}),
		]);

		return { accessToken, refreshToken };
	}
}
