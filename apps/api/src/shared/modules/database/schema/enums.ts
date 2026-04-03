import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['CANDIDATE', 'EMPLOYER', 'ADMIN']);
export const contractTypeEnum = pgEnum('contract_type', [
	'CLT',
	'PJ',
	'FREELANCER',
	'TEMPORARY',
	'INTERNSHIP',
	'OTHER',
]);
export const jobStatusEnum = pgEnum('job_status', [
	'ACTIVE',
	'PAUSED',
	'CLOSED',
	'EXPIRED',
]);
export const planEnum = pgEnum('plan', ['FREE', 'PRO', 'SEASON']);
export const contactMethodEnum = pgEnum('contact_method', [
	'WHATSAPP',
	'PLATFORM',
	'BOTH',
]);
export const interestStatusEnum = pgEnum('interest_status', [
	'SENT',
	'VIEWED',
	'CONTACTED',
	'REJECTED',
]);

export const candidateAvailabilityEnum = pgEnum('candidate_availability', [
	'IMMEDIATE',
	'IN_15_DAYS',
	'IN_30_DAYS',
	'NEGOTIABLE',
]);
