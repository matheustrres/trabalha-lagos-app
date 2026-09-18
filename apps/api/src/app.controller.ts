import { Controller, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AppService } from '@/app.service';

import { Public } from '@/common/decorators/public.decorator';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get('app')
	@Throttle({
		medium: { limit: 60, ttl: 60000 },
	})
	getHello(): string {
		return this.appService.getHello();
	}

	@Get('debug-sentry')
	@Public()
	debugSentry(): never {
		throw new Error('Sentry test from API');
	}
}
