/**
 * Valida um CNPJ conforme as regras da Receita Federal brasileira.
 * Aceita tanto CNPJ formatado (XX.XXX.XXX/XXXX-XX) quanto apenas dígitos.
 */
export function isValidCNPJ(cnpj: string): boolean {
	const stripped = cnpj.replace(/[^\d]/g, '');

	if (stripped.length !== 14) return false;

	// Rejeita sequências de dígitos iguais (ex: 11111111111111)
	if (/^(\d)\1+$/.test(stripped)) return false;

	const calcCheckDigit = (digits: string, weights: number[]): number => {
		const sum = digits
			.split('')
			.reduce((acc, d, i) => acc + parseInt(d, 10) * (weights[i] ?? 0), 0);
		const remainder = sum % 11;
		return remainder < 2 ? 0 : 11 - remainder;
	};

	const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
	const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

	const digit1 = calcCheckDigit(stripped.slice(0, 12), weights1);
	if (digit1 !== parseInt(stripped[12] ?? '', 10)) return false;

	const digit2 = calcCheckDigit(stripped.slice(0, 13), weights2);
	return digit2 === parseInt(stripped[13] ?? '', 10);
}
