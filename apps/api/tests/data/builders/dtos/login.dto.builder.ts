import type { LoginDto } from '@/modules/auth/dto/login.dto';

const defaults: LoginDto = {
	phone: '21999999999',
	password: 'senha@123',
};

export class LoginDtoBuilder {
	private props: LoginDto = { ...defaults };

	withPhone(phone: string): this {
		this.props = { ...this.props, phone };
		return this;
	}

	withPassword(password: string): this {
		this.props = { ...this.props, password };
		return this;
	}

	build(): LoginDto {
		return { ...this.props };
	}
}

export const aLoginDto = (): LoginDtoBuilder => new LoginDtoBuilder();
