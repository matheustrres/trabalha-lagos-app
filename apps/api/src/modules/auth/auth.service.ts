import {
	BadRequestException,
	ConflictException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

import { CompaniesService } from '@/modules/companies/companies.service';
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
		email: string;
		phone: string | null;
		city?: string | null;
		role: string;
	};
};

type JwtCredentialsPayload = {
	sub: string;
	role: string;
	credentialsVersion?: number;
};

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly companiesService: CompaniesService,
		private readonly jwtService: JwtService,
		private readonly envService: EnvService,
	) {}

	async register(dto: RegisterDto): Promise<AuthResult> {
		const email = dto.email.trim().toLowerCase();
		const existingUser = await this.usersService.findByEmail(email);

		if (existingUser) {
			throw new ConflictException('E-mail já cadastrado.');
		}

		if (dto.role === 'EMPLOYER' && dto.phone) {
			throw new BadRequestException(
				'Telefone pessoal não deve ser enviado por empregadores.',
			);
		}

		if (
			dto.role === 'CANDIDATE' &&
			(dto.companyName || dto.document || dto.segment || dto.companyWhatsapp)
		) {
			throw new BadRequestException(
				'Dados de empresa não devem ser enviados por candidatos.',
			);
		}

		const passwordHash = await argon2.hash(dto.password);

		const user = await this.usersService.create({
			name: dto.name,
			phone: dto.phone,
			email,
			passwordHash,
			city: dto.city,
			role: dto.role,
		});

		if (dto.role === 'EMPLOYER') {
			await this.companiesService.create(user.id, {
				name: dto.companyName!,
				city: dto.city,
				whatsapp: dto.companyWhatsapp,
				document: dto.document,
				segment: dto.segment,
			});
		}

		const tokens = await this.generateTokens(
			user.id,
			user.role,
			user.credentialsVersion,
		);

		return {
			...tokens,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				city: user.city,
				role: user.role,
			},
		};
	}

	async login(dto: LoginDto): Promise<AuthResult> {
		const user = await this.usersService.findByEmail(
			dto.email.trim().toLowerCase(),
		);

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

		const tokens = await this.generateTokens(
			user.id,
			user.role,
			user.credentialsVersion,
		);

		return {
			...tokens,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				city: user.city,
				role: user.role,
			},
		};
	}

	async refresh(refreshToken: string): Promise<AuthResult> {
		let payload: JwtCredentialsPayload;

		try {
			payload = this.jwtService.verify<JwtCredentialsPayload>(refreshToken, {
				secret: this.envService.getKeyOrThrow('JWT_REFRESH_SECRET'),
			});
		} catch {
			throw new UnauthorizedException('Refresh token inválido ou expirado.');
		}

		const user = await this.usersService.findById(payload.sub);

		if (!user) {
			throw new UnauthorizedException('Usuário não encontrado.');
		}
		if ((payload.credentialsVersion ?? 0) !== user.credentialsVersion) {
			throw new UnauthorizedException('Refresh token inválido ou expirado.');
		}

		const tokens = await this.generateTokens(
			user.id,
			user.role,
			user.credentialsVersion,
		);

		return {
			...tokens,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				phone: user.phone,
				city: user.city,
				role: user.role,
			},
		};
	}

	async updatePassword(
		userId: string,
		currentPassword: string,
		newPassword: string,
	): Promise<AuthResult> {
		const user = await this.usersService.findByIdOrFail(userId);
		const isCurrentPasswordValid = await argon2.verify(
			user.passwordHash,
			currentPassword,
		);
		if (!isCurrentPasswordValid) {
			throw new BadRequestException('Senha atual inválida.');
		}

		const passwordHash = await argon2.hash(newPassword);
		const updatedUser = await this.usersService.updateCredentials(
			userId,
			passwordHash,
		);
		const tokens = await this.generateTokens(
			updatedUser.id,
			updatedUser.role,
			updatedUser.credentialsVersion,
		);

		return {
			...tokens,
			user: {
				id: updatedUser.id,
				name: updatedUser.name,
				email: updatedUser.email,
				phone: updatedUser.phone,
				city: updatedUser.city,
				role: updatedUser.role,
			},
		};
	}

	private async generateTokens(
		userId: string,
		role: string,
		credentialsVersion: number,
	): Promise<TokenPair> {
		const payload = { sub: userId, role, credentialsVersion };

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
