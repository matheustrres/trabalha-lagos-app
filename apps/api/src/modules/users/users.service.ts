import { Injectable } from '@nestjs/common';

import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
	constructor(private readonly usersRepository: UsersRepository) {}

	async findByPhone(phone: string) {
		return this.usersRepository.findByPhone(phone);
	}

	async findByEmail(email: string) {
		return this.usersRepository.findByEmail(email);
	}

	async findById(id: string) {
		return this.usersRepository.findById(id);
	}

	async create(data: Parameters<UsersRepository['create']>[0]) {
		return this.usersRepository.create(data);
	}
}
