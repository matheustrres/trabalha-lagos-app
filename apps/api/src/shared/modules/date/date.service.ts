export abstract class DateServicePort {
	abstract now(): Date;
	abstract addDays(date: Date, amount: number): Date;
	abstract isBefore(date: Date, dateToCompare: Date): boolean;
}
