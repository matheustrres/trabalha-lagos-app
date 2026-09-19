import type { AdzunaJob } from './adzuna.types';

import { LAGOS_CITIES, LAGOS_REGION_BOUNDS } from '@/common/constants/cities';

const EARTH_RADIUS_KM = 6371;

function toRadians(value: number): number {
	return (value * Math.PI) / 180;
}

export function haversineDistanceKm(
	latitudeA: number,
	longitudeA: number,
	latitudeB: number,
	longitudeB: number,
): number {
	const latitudeDelta = toRadians(latitudeB - latitudeA);
	const longitudeDelta = toRadians(longitudeB - longitudeA);
	const a =
		Math.sin(latitudeDelta / 2) ** 2 +
		Math.cos(toRadians(latitudeA)) *
			Math.cos(toRadians(latitudeB)) *
			Math.sin(longitudeDelta / 2) ** 2;

	return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

export function isValidWgs84(latitude: number, longitude: number): boolean {
	return (
		Number.isFinite(latitude) &&
		Number.isFinite(longitude) &&
		latitude >= -90 &&
		latitude <= 90 &&
		longitude >= -180 &&
		longitude <= 180
	);
}

function normalizeText(value: string): string {
	return value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase();
}

export function classifyGeography(
	coordinates: { latitude: number; longitude: number } | undefined,
	locationText: string | undefined,
): Pick<
	AdzunaJob,
	| 'nearestCity'
	| 'nearestCitySlug'
	| 'distanceKm'
	| 'geoClassification'
	| 'isOutsideRegion'
	| 'locationDiverges'
> {
	if (
		!coordinates ||
		!isValidWgs84(coordinates.latitude, coordinates.longitude)
	) {
		return {
			geoClassification: coordinates ? 'SUSPICIOUS' : 'WITHOUT_COORDINATES',
			isOutsideRegion: Boolean(coordinates),
			locationDiverges: false,
		};
	}

	const nearest = LAGOS_CITIES.map((city) => ({
		city,
		distanceKm: haversineDistanceKm(
			coordinates.latitude,
			coordinates.longitude,
			city.lat,
			city.lng,
		),
	})).sort((a, b) => a.distanceKm - b.distanceKm)[0];

	if (!nearest) {
		throw new Error('Nenhuma cidade regional configurada.');
	}

	const { latMin, latMax, lngMin, lngMax } = LAGOS_REGION_BOUNDS;
	const isOutsideRegion =
		coordinates.latitude < latMin ||
		coordinates.latitude > latMax ||
		coordinates.longitude < lngMin ||
		coordinates.longitude > lngMax;
	const normalizedLocation = locationText ? normalizeText(locationText) : '';
	const locationDiverges = Boolean(
		normalizedLocation &&
		!normalizedLocation.includes(normalizeText(nearest.city.name)) &&
		!(nearest.city.slug === 'buzios' && normalizedLocation.includes('buzios')),
	);

	return {
		nearestCity: nearest.city.name,
		nearestCitySlug: nearest.city.slug,
		distanceKm: Number(nearest.distanceKm.toFixed(2)),
		geoClassification:
			isOutsideRegion || locationDiverges ? 'SUSPICIOUS' : 'VALID',
		isOutsideRegion,
		locationDiverges,
	};
}
