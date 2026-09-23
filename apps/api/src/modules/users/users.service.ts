import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

import { UsersRepository } from './users.repository';

import { NewUserSchema, UserSchema } from '@/shared/modules/database/schema';

@Injectable()
export class UsersService {
	constructor(private readonly usersRepository: UsersRepository) {}

	async findByPhone(phone: string): Promise<UserSchema | null> {
		return this.usersRepository.findByPhone(phone);
	}

	async findByEmail(email: string): Promise<UserSchema | null> {
		return this.usersRepository.findByEmail(email);
	}

	async findById(id: string): Promise<UserSchema | null> {
		return this.usersRepository.findById(id);
	}

	async create(
		data: Parameters<UsersRepository['create']>[0],
	): Promise<NewUserSchema> {
		return this.usersRepository.create(data);
	}

	async findByIdOrFail(id: string): Promise<UserSchema> {
		const user = await this.findById(id);
		if (!user) {
			throw new NotFoundException('Usuário não encontrado.');
		}

		return user;
	}

	async updateProfile(
		userId: string,
		data: Parameters<UsersRepository['updateProfile']>[1],
	): Promise<UserSchema> {
		const user = await this.usersRepository.updateProfile(userId, data);
		if (!user) {
			throw new NotFoundException('Usuário não encontrado.');
		}

		return user;
	}

	async updateAccount(
		userId: string,
		data: Parameters<UsersRepository['updateAccount']>[1],
	): Promise<UserSchema> {
		const user = await this.usersRepository.updateAccount(userId, data);
		if (!user) {
			throw new NotFoundException('Usuário não encontrado.');
		}

		return user;
	}

	async updateEmail(
		userId: string,
		email: string,
		currentPassword: string,
	): Promise<UserSchema> {
		const user = await this.findByIdOrFail(userId);
		if (!(await argon2.verify(user.passwordHash, currentPassword))) {
			throw new BadRequestException('Senha atual inválida.');
		}

		const normalizedEmail = email.trim().toLowerCase();
		if (normalizedEmail === user.email) return user;

		const existingUser = await this.findByEmail(normalizedEmail);
		if (existingUser) {
			throw new BadRequestException('Este e-mail já está em uso.');
		}

		const updatedUser = await this.usersRepository.updateEmail(
			userId,
			normalizedEmail,
		);
		if (!updatedUser) {
			throw new NotFoundException('Usuário não encontrado.');
		}

		return updatedUser;
	}

	async updateCredentials(
		userId: string,
		passwordHash: string,
	): Promise<UserSchema> {
		const user = await this.usersRepository.updateCredentials(
			userId,
			passwordHash,
		);
		if (!user) {
			throw new NotFoundException('Usuário não encontrado.');
		}

		return user;
	}

	async deleteAccount(userId: string, currentPassword: string): Promise<void> {
		const user = await this.findByIdOrFail(userId);
		if (!(await argon2.verify(user.passwordHash, currentPassword))) {
			throw new BadRequestException('Senha atual inválida.');
		}

		const deleted = await this.usersRepository.deleteById(userId);
		if (!deleted) {
			throw new NotFoundException('Usuário não encontrado.');
		}
	}
}
