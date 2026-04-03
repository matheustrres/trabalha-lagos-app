import {
	CanActivate,
	ExecutionContext,
	Injectable,
	OnModuleInit,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
	InjectThrottlerOptions,
	InjectThrottlerStorage,
	ThrottlerGuard,
	type ThrottlerModuleOptions,
	type ThrottlerStorage,
} from '@nestjs/throttler';

import { EnvService } from '@/shared/modules/env/env.service';

@Injectable()
export class GlobalThrottlerGuard implements CanActivate, OnModuleInit {
	private readonly throttlerGuard: ThrottlerGuard;

	constructor(
		@InjectThrottlerOptions()
		private readonly options: ThrottlerModuleOptions,
		@InjectThrottlerStorage()
		private readonly storageService: ThrottlerStorage,
		private readonly envService: EnvService,
	) {
		this.throttlerGuard = new ThrottlerGuard(
			this.options,
			this.storageService,
			new Reflector(),
		);
	}

	async onModuleInit(): Promise<void> {
		await this.throttlerGuard.onModuleInit();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		if (!this.envService.getKey('THROTTLE_ENABLED')) {
			return true;
		}

		return this.throttlerGuard.canActivate(context);
	}
}
