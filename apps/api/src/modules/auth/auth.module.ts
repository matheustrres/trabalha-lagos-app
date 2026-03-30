import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

import { UsersModule } from '@/modules/users/users.module';

import { EnvModule } from '@/shared/modules/env/env.module';

@Module({
	imports: [JwtModule.register({}), UsersModule, EnvModule],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
	exports: [AuthService],
})
export class AuthModule {}
