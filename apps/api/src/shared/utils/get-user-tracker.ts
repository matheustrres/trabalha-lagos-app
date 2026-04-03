export function getUserTracker(req: Record<string, unknown>): string {
	const user = req['user'] as Record<string, unknown> | undefined;
	const tracker = user?.['userId'] ?? user?.['sub'] ?? req['ip'] ?? 'unknown';
	return String(tracker);
}
