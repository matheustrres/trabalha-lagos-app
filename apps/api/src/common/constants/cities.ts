export const LAGOS_CITIES = [
	{ slug: 'cabo-frio', name: 'Cabo Frio', lat: -22.8789, lng: -42.0187 },
	{
		slug: 'buzios',
		name: 'Armação dos Búzios',
		lat: -22.7469,
		lng: -41.8817,
	},
	{
		slug: 'arraial-do-cabo',
		name: 'Arraial do Cabo',
		lat: -22.966,
		lng: -42.0275,
	},
	{
		slug: 'sao-pedro-da-aldeia',
		name: 'São Pedro da Aldeia',
		lat: -22.8394,
		lng: -42.1027,
	},
	{ slug: 'araruama', name: 'Araruama', lat: -22.8729, lng: -42.3431 },
	{ slug: 'saquarema', name: 'Saquarema', lat: -22.92, lng: -42.5103 },
	{
		slug: 'iguaba-grande',
		name: 'Iguaba Grande',
		lat: -22.8392,
		lng: -42.2289,
	},
] as const;

export const LAGOS_REGION_BOUNDS = {
	latMin: -23.1,
	latMax: -22.6,
	lngMin: -42.6,
	lngMax: -41.8,
} as const;

export type LagosCity = (typeof LAGOS_CITIES)[number];
export type LagosCitySlug = LagosCity['slug'];
