import type { RegisterDto } from '@/modules/auth/dto/register.dto';

const defaults: RegisterDto = {
	name: 'João Silva',
	phone: '21999999999',
	email: 'joao@trabalhalagos.com',
	password: 'Senha@123',
	city: 'Cabo Frio',
	role: 'CANDIDATE',
	document: '',
};

export class RegisterDtoBuilder {
	private props: RegisterDto = { ...defaults };

	withName(name: string): this {
		this.props = { ...this.props, name };
		return this;
	}

	withPhone(phone: string): this {
		this.props = { ...this.props, phone };
		return this;
	}

	withEmail(email: string): this {
		this.props = { ...this.props, email };
		return this;
	}

	withPassword(password: string): this {
		this.props = { ...this.props, password };
		return this;
	}

	withCity(city: string): this {
		this.props = { ...this.props, city };
		return this;
	}

	withRole(role: 'CANDIDATE' | 'EMPLOYER'): this {
		this.props = { ...this.props, role };
		return this;
	}

	build(): RegisterDto {
		return { ...this.props };
	}
}

export const aRegisterDto = (): RegisterDtoBuilder => new RegisterDtoBuilder();
