export function generateJobSlug(title: string, city: string): string {
	const base = `${title} ${city}`
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.slice(0, 60);
	const suffix = Math.random().toString(36).slice(2, 6);
	return `${base}-${suffix}`;
}
