export function getIpTracker(req: Record<string, unknown>): string {
	const headers = req['headers'] as Record<string, unknown> | undefined;
	const ips = req['ips'] as string[] | undefined;
	const forwardedFor = headers?.['x-forwarded-for']
		?.toString()
		.split(',')[0]
		?.trim();
	const ip = forwardedFor || req['ip'] || ips?.[0] || 'unknown';
	return String(ip);
}
