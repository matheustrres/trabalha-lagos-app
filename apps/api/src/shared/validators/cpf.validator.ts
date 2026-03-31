/**
 * Valida um CPF conforme as regras da Receita Federal brasileira.
 * Aceita tanto CPF formatado (XXX.XXX.XXX-XX) quanto apenas dígitos.
 */
export function isValidCPF(cpf: string): boolean {
	const stripped = cpf.replace(/[^\d]/g, '');

	if (stripped.length !== 11) return false;

	// Rejeita sequências de dígitos iguais (ex: 11111111111)
	if (/^(\d)\1+$/.test(stripped)) return false;

	const calcCheckDigit = (digits: string, weights: number[]): number => {
		const sum = digits
			.split('')
			.reduce((acc, d, i) => acc + parseInt(d, 10) * (weights[i] ?? 0), 0);
		const remainder = sum % 11;
		return remainder < 2 ? 0 : 11 - remainder;
	};

	const digit1 = calcCheckDigit(
		stripped.slice(0, 9),
		[10, 9, 8, 7, 6, 5, 4, 3, 2],
	);
	const digit1Char = stripped[9];
	if (!digit1Char || digit1 !== parseInt(digit1Char, 10)) return false;

	const digit2 = calcCheckDigit(
		stripped.slice(0, 10),
		[11, 10, 9, 8, 7, 6, 5, 4, 3, 2],
	);
	const digit2Char = stripped[10];
	return digit2Char !== undefined && digit2 === parseInt(digit2Char, 10);
}
