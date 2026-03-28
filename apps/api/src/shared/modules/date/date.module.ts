import { Module } from '@nestjs/common';

import { DateFnsService } from '@/shared/modules/date/date-fns.service';
import { DateServicePort } from '@/shared/modules/date/date.service';

@Module({
	providers: [{ provide: DateServicePort, useClass: DateFnsService }],
	exports: [DateServicePort],
})
export class DateModule {}
