import {
	classifyGeography,
	haversineDistanceKm,
} from '@/modules/external-jobs/integrations/adzuna/adzuna-geography';

describe('geografia Adzuna', () => {
	it('calcula Haversine em quilômetros', () => {
		const distance = haversineDistanceKm(-22.8789, -42.0187, -22.966, -42.0275);
		expect(distance).toBeGreaterThan(9);
		expect(distance).toBeLessThan(11);
	});

	it('classifica coordenadas ausentes e inválidas', () => {
		expect(classifyGeography(undefined, 'Cabo Frio')).toMatchObject({
			geoClassification: 'WITHOUT_COORDINATES',
		});
		expect(
			classifyGeography({ latitude: 200, longitude: -42 }, 'Cabo Frio'),
		).toMatchObject({ geoClassification: 'SUSPICIOUS' });
	});

	it('sinaliza coordenadas fora do bounding box', () => {
		expect(
			classifyGeography(
				{ latitude: -22.9, longitude: -43.2 },
				'Rio de Janeiro',
			),
		).toMatchObject({
			geoClassification: 'SUSPICIOUS',
			isOutsideRegion: true,
		});
	});

	it('sinaliza divergência entre texto e cidade mais próxima', () => {
		expect(
			classifyGeography(
				{ latitude: -22.8789, longitude: -42.0187 },
				'Pavuna, Rio de Janeiro',
			),
		).toMatchObject({
			nearestCity: 'Cabo Frio',
			locationDiverges: true,
			geoClassification: 'SUSPICIOUS',
		});
	});
});
