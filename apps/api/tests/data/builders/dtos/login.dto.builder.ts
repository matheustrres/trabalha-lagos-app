import type { LoginDto } from '@/modules/auth/dto/login.dto';

const defaults: LoginDto = {
	email: 'joao@trabalhalagos.com',
	password: 'senha@123',
};

export class LoginDtoBuilder {
	private props: LoginDto = { ...defaults };

	withEmail(email: string): this {
		this.props = { ...this.props, email };
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
