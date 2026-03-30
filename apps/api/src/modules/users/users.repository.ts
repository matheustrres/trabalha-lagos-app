import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';

import {
	DATABASE_TOKEN,
	type Database,
} from '@/shared/modules/database/database.provider';
import { users } from '@/shared/modules/database/schema';

type CreateUserData = {
	name: string;
	phone: string;
	email?: string;
	passwordHash: string;
	city: string;
	role: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
};

@Injectable()
export class UsersRepository {
	constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

	async findByPhone(phone: string) {
		const [user] = await this.db
			.select()
			.from(users)
			.where(eq(users.phone, phone))
			.limit(1);
		return user ?? null;
	}

	async findByEmail(email: string) {
		const [user] = await this.db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);
		return user ?? null;
	}

	async findById(id: string) {
		const [user] = await this.db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1);
		return user ?? null;
	}

	async create(data: CreateUserData) {
		const [user] = await this.db
			.insert(users)
			.values({
				name: data.name,
				phone: data.phone,
				email: data.email,
				passwordHash: data.passwordHash,
				city: data.city,
				role: data.role,
			})
			.returning({
				id: users.id,
				name: users.name,
				phone: users.phone,
				email: users.email,
				city: users.city,
				role: users.role,
				createdAt: users.createdAt,
			});
		return user!;
	}
}
