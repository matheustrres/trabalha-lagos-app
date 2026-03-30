import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { type JwtPayload } from './jwt.strategy';

import { EnvService } from '@/shared/modules/env/env.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh',
) {
	constructor(envService: EnvService) {
		super({
			jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
			ignoreExpiration: false,
			secretOrKey: envService.getKeyOrThrow('JWT_REFRESH_SECRET'),
		});
	}

	validate(payload: JwtPayload) {
		if (!payload.sub || !payload.role) {
			throw new UnauthorizedException();
		}
		return { userId: payload.sub, role: payload.role };
	}
}
