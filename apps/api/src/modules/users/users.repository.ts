import { Inject, Injectable } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';

import {
	DATABASE_TOKEN,
	type Database,
} from '@/shared/modules/database/database.provider';
import {
	NewUserSchema,
	UserSchema,
	users,
} from '@/shared/modules/database/schema';

type UpdateUserProfileData = {
	phone?: string | null;
	interests?: string[];
	experience?: string;
	availability?: 'IMMEDIATE' | 'IN_15_DAYS' | 'IN_30_DAYS' | 'NEGOTIABLE';
	acceptedContractTypes?: string[];
	neighborhood?: string;
};

type UpdateAccountData = { name: string; city: string };

@Injectable()
export class UsersRepository {
	constructor(@Inject(DATABASE_TOKEN) private readonly db: Database) {}

	async findByPhone(phone: string): Promise<UserSchema | null> {
		const [user] = await this.db
			.select()
			.from(users)
			.where(eq(users.phone, phone))
			.limit(1);
		return user ?? null;
	}

	async findByEmail(email: string): Promise<UserSchema | null> {
		const [user] = await this.db
			.select()
			.from(users)
			.where(eq(users.email, email))
			.limit(1);
		return user ?? null;
	}

	async findById(id: string): Promise<UserSchema | null> {
		const [user] = await this.db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1);
		return user ?? null;
	}

	async create(data: CreateUserData): Promise<NewUserSchema> {
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
				credentialsVersion: users.credentialsVersion,
				createdAt: users.createdAt,
			});
		return user!;
	}

	async updateProfile(
		userId: string,
		data: UpdateUserProfileData,
	): Promise<UserSchema | null> {
		const [user] = await this.db
			.update(users)
			.set({
				phone: data.phone,
				interests: data.interests,
				experience: data.experience,
				availability: data.availability,
				acceptedContractTypes: data.acceptedContractTypes,
				neighborhood: data.neighborhood,
				updatedAt: new Date(),
			})
			.where(eq(users.id, userId))
			.returning();

		return user ?? null;
	}

	async updateAccount(
		userId: string,
		data: UpdateAccountData,
	): Promise<UserSchema | null> {
		const [user] = await this.db
			.update(users)
			.set({ ...data, updatedAt: new Date() })
			.where(eq(users.id, userId))
			.returning();

		return user ?? null;
	}

	async updateCredentials(
		userId: string,
		passwordHash: string,
	): Promise<UserSchema | null> {
		const [user] = await this.db
			.update(users)
			.set({
				passwordHash,
				credentialsVersion: sql`${users.credentialsVersion} + 1`,
				updatedAt: new Date(),
			})
			.where(eq(users.id, userId))
			.returning();

		return user ?? null;
	}

	async deleteById(userId: string): Promise<boolean> {
		const deleted = await this.db
			.delete(users)
			.where(eq(users.id, userId))
			.returning({ id: users.id });

		return deleted.length > 0;
	}
}

type CreateUserData = {
	name: string;
	phone?: string;
	email: string;
	passwordHash: string;
	city: string;
	role: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
};
