export type CompanySchema = {
	id: string;
	userId: string;
	name: string;
	document: string | null;
	city: string;
	segment: string | null;
	logoUrl: string | null;
	whatsapp: string | null;
	plan: 'FREE' | 'PRO' | 'SEASON';
	planExpiresAt: Date | null;
	verified: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export type CompanySchemaWithUser = CompanySchema & {
	user: {
		id: string;
		name: string;
		phone: string;
		city: string | null;
	};
};

const defaults: CompanySchema = {
	id: 'company-uuid-1',
	userId: 'user-uuid-1',
	name: 'Empresa Teste',
	document: '11222333000181',
	city: 'Cabo Frio',
	segment: 'Turismo',
	logoUrl: null,
	whatsapp: '22999999999',
	plan: 'FREE',
	planExpiresAt: null,
	verified: false,
	createdAt: new Date('2026-01-01T00:00:00.000Z'),
	updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

export class CompanyBuilder {
	private props: CompanySchema = { ...defaults };

	withId(id: string): this {
		this.props = { ...this.props, id };
		return this;
	}

	withUserId(userId: string): this {
		this.props = { ...this.props, userId };
		return this;
	}

	withName(name: string): this {
		this.props = { ...this.props, name };
		return this;
	}

	withPlan(plan: 'FREE' | 'PRO' | 'SEASON'): this {
		this.props = { ...this.props, plan };
		return this;
	}

	build(): CompanySchema {
		return { ...this.props };
	}

	buildWithUser(): CompanySchemaWithUser {
		return {
			...this.props,
			user: {
				id: 'user-uuid-1',
				name: 'João Silva',
				phone: '22999999999',
				city: 'Cabo Frio',
			},
		};
	}
}

export const aCompany = (): CompanyBuilder => new CompanyBuilder();
