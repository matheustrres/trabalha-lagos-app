/**
 * Valida um telefone brasileiro (celular ou fixo).
 * Aceita formatos: (XX) XXXXX-XXXX, XX XXXXX-XXXX, XXXXXXXXXXX
 */
export function isValidPhoneBR(phone: string): boolean {
	const stripped = phone.replace(/[^\d]/g, '');

	// Celular: 11 dígitos (DDD + 9 dígitos)
	// Fixo: 10 dígitos (DDD + 8 dígitos)
	if (stripped.length < 10 || stripped.length > 11) return false;

	const ddd = parseInt(stripped.slice(0, 2), 10);

	// DDD válido (1-99)
	if (ddd < 1 || ddd > 99) return false;

	// Telefones válidos no Brasil
	const secondDigit = stripped[2];

	// Celular deve ter 9 como segundo dígito do número (após DDD)
	// Fixo deve ter 2-5 como segundo dígito
	if (stripped.length === 11 && secondDigit !== '9') return false;
	if (
		stripped.length === 10 &&
		(!secondDigit || secondDigit < '2' || secondDigit > '5')
	)
		return false;

	// Não pode ter todos os dígitos iguais
	if (/^(\d)\1+$/.test(stripped)) return false;

	return true;
}
