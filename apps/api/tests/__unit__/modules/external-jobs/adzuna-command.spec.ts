import { parseAdzunaArguments } from '@/modules/external-jobs/integrations/adzuna/adzuna-command-options';

describe('parseAdzunaArguments', () => {
	it('aplica defaults seguros', () => {
		const config = parseAdzunaArguments([]);
		expect(config).toMatchObject({
			page: 1,
			distanceKm: 25,
			resultsPerCity: 20,
			maxDaysOld: 30,
			sortBy: 'date',
			country: 'br',
		});
		expect(config.cities).toHaveLength(7);
	});

	it('aceita cidade e limites explícitos', () => {
		const config = parseAdzunaArguments([
			'--',
			'--city=cabo-frio',
			'--distance=25',
			'--results=10',
			'--max-days-old=7',
		]);
		expect(config.cities.map((city) => city.slug)).toEqual(['cabo-frio']);
		expect(config.resultsPerCity).toBe(10);
	});

	it('ignora o separador de argumentos encaminhado pelo pnpm', () => {
		const config = parseAdzunaArguments([
			'--',
			'--distance=25',
			'--results=20',
			'--max-days-old=30',
		]);

		expect(config).toMatchObject({
			distanceKm: 25,
			resultsPerCity: 20,
			maxDaysOld: 30,
		});
		expect(config.cities).toHaveLength(7);
	});

	it('rejeita cidade ou argumento inválido', () => {
		expect(() => parseAdzunaArguments(['--city=niteroi'])).toThrow(
			'Cidade inválida',
		);
		expect(() => parseAdzunaArguments(['--page=2'])).toThrow(
			'Argumento desconhecido',
		);
	});
});
