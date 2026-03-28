import { Injectable } from '@nestjs/common';
import { addDays, isBefore } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import { DateServicePort } from '@/shared/modules/date/date.service';

const TIMEZONE = 'America/Sao_Paulo';

@Injectable()
export class DateFnsService extends DateServicePort {
	now(): Date {
		return toZonedTime(new Date(), TIMEZONE);
	}

	addDays(date: Date, amount: number): Date {
		return addDays(date, amount);
	}

	isBefore(date: Date, dateToCompare: Date): boolean {
		return isBefore(date, dateToCompare);
	}
}
