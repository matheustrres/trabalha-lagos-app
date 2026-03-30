import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { EnvService } from '@/shared/modules/env/env.service';

export type JwtPayload = {
	sub: string;
	role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(envService: EnvService) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: envService.getKeyOrThrow('JWT_SECRET'),
		});
	}

	validate(payload: JwtPayload) {
		if (!payload.sub || !payload.role) {
			throw new UnauthorizedException();
		}
		return { userId: payload.sub, role: payload.role };
	}
}
