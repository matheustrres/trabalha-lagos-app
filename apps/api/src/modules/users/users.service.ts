import { Injectable, NotFoundException } from '@nestjs/common';

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
}
