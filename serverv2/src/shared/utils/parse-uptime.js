export function parseUptime(uptimeStr) {
	if (!uptimeStr || typeof uptimeStr !== "string") return 0;

	const pattern = /(\d+)([wdhms])/g;
	const unitSeconds = { w: 604800, d: 86400, h: 3600, m: 60, s: 1 };

	let totalSeconds = 0;
	let match;
	while ((match = pattern.exec(uptimeStr)) !== null) {
		const [, value, unit] = match;
		totalSeconds += Number(value) * (unitSeconds[unit] || 0);
	}

	return totalSeconds;
}