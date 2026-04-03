import { Controller, Get } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { AppService } from '@/app.service';

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
}
