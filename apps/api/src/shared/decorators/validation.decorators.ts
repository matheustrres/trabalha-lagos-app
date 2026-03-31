import {
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
	registerDecorator,
} from 'class-validator';

import { isValidCNPJ } from '../validators/cnpj.validator';
import { isValidCPF } from '../validators/cpf.validator';
import { isValidPhoneBR } from '../validators/phone.validator';

@ValidatorConstraint({ name: 'isValidCNPJ', async: false })
export class IsValidCNPJConstraint implements ValidatorConstraintInterface {
	validate(cnpj: string) {
		if (!cnpj) return true; // Optional fields
		return isValidCNPJ(cnpj);
	}

	defaultMessage() {
		return 'CNPJ inválido';
	}
}

@ValidatorConstraint({ name: 'isValidCPF', async: false })
export class IsValidCPFConstraint implements ValidatorConstraintInterface {
	validate(cpf: string) {
		if (!cpf) return true; // Optional fields
		return isValidCPF(cpf);
	}

	defaultMessage() {
		return 'CPF inválido';
	}
}

@ValidatorConstraint({ name: 'isValidPhoneBR', async: false })
export class IsValidPhoneBRConstraint implements ValidatorConstraintInterface {
	validate(phone: string) {
		if (!phone) return true; // Optional fields
		return isValidPhoneBR(phone);
	}

	defaultMessage() {
		return 'Telefone brasileiro inválido';
	}
}

// Decorator IsValidCNPJ
export function IsValidCNPJ(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName,
			options: validationOptions,
			constraints: [],
			validator: IsValidCNPJConstraint,
		});
	};
}

// Decorator IsValidCPF
export function IsValidCPF(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName,
			options: validationOptions,
			constraints: [],
			validator: IsValidCPFConstraint,
		});
	};
}

// Decorator IsValidPhoneBR
export function IsValidPhoneBR(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName,
			options: validationOptions,
			constraints: [],
			validator: IsValidPhoneBRConstraint,
		});
	};
}

// Decorator IsValidPhone - alias for IsValidPhoneBR
export function IsValidPhone(validationOptions?: ValidationOptions) {
	return IsValidPhoneBR(validationOptions);
}
