export type CategoryRow = {
	id: number;
	name: string;
	slug: string;
	icon: string;
	order: number;
	jobCount: number;
};

export type CategorySchema = {
	id: number;
	name: string;
	slug: string;
	icon: string | null;
	order: number;
	createdAt: Date;
	updatedAt: Date;
};

const defaults: CategoryRow = {
	id: 1,
	name: 'Turismo e Hospitalidade',
	slug: 'turismo-hospitalidade',
	icon: '🏨',
	order: 1,
	jobCount: 5,
};

export class CategoryBuilder {
	private props: CategoryRow = { ...defaults };

	withId(id: number): this {
		this.props = { ...this.props, id };
		return this;
	}

	withName(name: string): this {
		this.props = { ...this.props, name };
		return this;
	}

	withSlug(slug: string): this {
		this.props = { ...this.props, slug };
		return this;
	}

	withJobCount(count: number): this {
		this.props = { ...this.props, jobCount: count };
		return this;
	}

	build(): CategoryRow {
		return { ...this.props };
	}
}

export const aCategory = (): CategoryBuilder => new CategoryBuilder();
