export type InterestStatus = 'SENT' | 'VIEWED' | 'CONTACTED' | 'REJECTED';

export type InterestSchema = {
	id: string;
	userId: string | null;
	jobId: string;
	name: string;
	phone: string;
	city: string;
	status: InterestStatus;
	createdAt: Date;
};

export type InterestSchemaWithJobTitle = InterestSchema & {
	jobTitle: string;
	jobSlug: string;
};

const defaults: InterestSchema = {
	id: 'interest-uuid-1',
	userId: 'user-uuid-1',
	jobId: 'job-uuid-1',
	name: 'João Silva',
	phone: '22999999999',
	city: 'Cabo Frio',
	status: 'SENT',
	createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

export class InterestBuilder {
	private props: InterestSchema = { ...defaults };

	withId(id: string): this {
		this.props = { ...this.props, id };
		return this;
	}

	withUserId(userId: string | null): this {
		this.props = { ...this.props, userId };
		return this;
	}

	withJobId(jobId: string): this {
		this.props = { ...this.props, jobId };
		return this;
	}

	withName(name: string): this {
		this.props = { ...this.props, name };
		return this;
	}

	withStatus(status: InterestStatus): this {
		this.props = { ...this.props, status };
		return this;
	}

	build(): InterestSchema {
		return { ...this.props };
	}

	buildWithJobTitle(): InterestSchemaWithJobTitle {
		return {
			...this.props,
			jobTitle: 'Vaga de Turismo',
			jobSlug: 'vaga-de-turismo-uuid',
		};
	}
}

export const anInterest = (): InterestBuilder => new InterestBuilder();
