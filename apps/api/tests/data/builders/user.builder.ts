type UserRole = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
type CandidateAvailability =
	| 'IMMEDIATE'
	| 'IN_15_DAYS'
	| 'IN_30_DAYS'
	| 'NEGOTIABLE';

export type User = {
	id: string;
	name: string;
	phone: string | null;
	email: string;
	passwordHash: string;
	city: string | null;
	interests: string[] | null;
	experience: string | null;
	availability: CandidateAvailability | null;
	acceptedContractTypes: string[] | null;
	neighborhood: string | null;
	role: UserRole;
	lat: number | null;
	lng: number | null;
	searchRadius: number | null;
	createdAt: Date;
	updatedAt: Date;
};

export type CreatedUser = Pick<
	User,
	'id' | 'name' | 'phone' | 'email' | 'city' | 'role' | 'createdAt'
>;

const defaults: User = {
	id: 'user-uuid-1',
	name: 'João Silva',
	phone: '21999999999',
	email: 'joao@trabalhalagos.com',
	passwordHash: '$argon2id$mock-hash',
	city: 'Cabo Frio',
	interests: null,
	experience: null,
	availability: null,
	acceptedContractTypes: null,
	neighborhood: null,
	role: 'CANDIDATE',
	lat: null,
	lng: null,
	searchRadius: 10,
	createdAt: new Date('2026-01-01T00:00:00.000Z'),
	updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

export class UserBuilder {
	private props: User = { ...defaults };

	withId(id: string): this {
		this.props = { ...this.props, id };
		return this;
	}

	withName(name: string): this {
		this.props = { ...this.props, name };
		return this;
	}

	withPhone(phone: string | null): this {
		this.props = { ...this.props, phone };
		return this;
	}

	withEmail(email: string): this {
		this.props = { ...this.props, email };
		return this;
	}

	withPasswordHash(passwordHash: string): this {
		this.props = { ...this.props, passwordHash };
		return this;
	}

	withCity(city: string | null): this {
		this.props = { ...this.props, city };
		return this;
	}

	withRole(role: UserRole): this {
		this.props = { ...this.props, role };
		return this;
	}

	/** Full row as returned by SELECT (findBy* methods). */
	build(): User {
		return { ...this.props };
	}

	/** Subset returned by INSERT...RETURNING (create method). */
	buildCreated(): CreatedUser {
		return {
			id: this.props.id,
			name: this.props.name,
			phone: this.props.phone,
			email: this.props.email,
			city: this.props.city,
			role: this.props.role,
			createdAt: this.props.createdAt,
		};
	}
}

export const aUser = (): UserBuilder => new UserBuilder();
