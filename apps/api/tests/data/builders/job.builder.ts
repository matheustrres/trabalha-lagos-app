export type JobStatus = 'ACTIVE' | 'PAUSED' | 'CLOSED';

export type JobSchema = {
	id: string;
	companyId: string;
	title: string;
	description: string;
	status: JobStatus;
	categoryId: number;
	contractType: string;
	city: string;
	address: string | null;
	locationLng: number | null;
	locationLat: number | null;
	salaryMin: number | null;
	salaryMax: number | null;
	salaryHidden: boolean;
	whatsappContact: string | null;
	contactMethod: string;
	requirements: string[];
	slug: string;
	viewCount: number;
	interestCount: number;
	featured: boolean;
	urgent: boolean;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
};

const defaults: JobSchema = {
	id: 'job-uuid-1',
	companyId: 'company-uuid-1',
	title: 'Atendente de Turismo',
	description: 'Descrição da vaga',
	status: 'ACTIVE',
	categoryId: 1,
	contractType: 'CLT',
	city: 'Cabo Frio',
	address: 'Rua das Flores, 123',
	locationLng: -42.0187,
	locationLat: -22.8789,
	salaryMin: 200000,
	salaryMax: 300000,
	salaryHidden: false,
	whatsappContact: '22999999999',
	contactMethod: 'WHATSAPP',
	requirements: ['Experiência em atendimento'],
	slug: 'atendente-de-turismo',
	viewCount: 0,
	interestCount: 0,
	featured: false,
	urgent: false,
	expiresAt: new Date('2026-02-01T00:00:00.000Z'),
	createdAt: new Date('2026-01-01T00:00:00.000Z'),
	updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

export class JobBuilder {
	private props: JobSchema = { ...defaults };

	withId(id: string): this {
		this.props = { ...this.props, id };
		return this;
	}

	withStatus(status: JobStatus): this {
		this.props = { ...this.props, status };
		return this;
	}

	withCompanyId(companyId: string): this {
		this.props = { ...this.props, companyId };
		return this;
	}

	build(): JobSchema {
		return { ...this.props };
	}
}

export const aJob = (): JobBuilder => new JobBuilder();
