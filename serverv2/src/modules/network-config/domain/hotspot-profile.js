export const toRateLimit = (uploadMbps, downloadMbps) => `${uploadMbps}M/${downloadMbps}M`;

export function parseRateLimit(value) {
	const match = /^(\d+)([kMG]?)\/(\d+)([kMG]?)(?:\s.*)?$/.exec(String(value ?? "").trim());
	if (!match) return null;

	const toMbps = (amount, unit) => {
		const n = Number(amount);
		if (unit === "G") return n * 1000;
		if (unit === "k") return n / 1000;
		return n;
	};

	const uploadMbps = toMbps(match[1], match[2]);
	const downloadMbps = toMbps(match[3], match[4]);
	if (!Number.isInteger(uploadMbps) || !Number.isInteger(downloadMbps) || uploadMbps < 1 || downloadMbps < 1) return null;

	return { uploadMbps, downloadMbps };
}

const yesNo = (value) => (value ? "yes" : "no");
export const asBool = (value) => ["yes", "true", true].includes(value);

export function toRouterFields(profile) {
	return {
		"rate-limit": toRateLimit(profile.uploadMbps, profile.downloadMbps),
		"shared-users": String(profile.sharedUsers),
		"mac-cookie-timeout": profile.macCookieTimeout,
		"idle-timeout": profile.idleTimeout,
		"status-autorefresh": profile.statusAutorefresh,
		"add-mac-cookie": yesNo(profile.addMacCookie),
		"transparent-proxy": yesNo(profile.transparentProxy),
		"open-status-page": profile.openStatusPage,
		advertise: yesNo(profile.advertise)
	};
}

const BOOLEAN_FIELDS = new Set(["add-mac-cookie", "transparent-proxy", "advertise"]);

export function diffRouterFields(desired, row) {
	const changes = {};

	for (const [field, value] of Object.entries(desired)) {
		const current = row[field];
		const same = BOOLEAN_FIELDS.has(field) ? asBool(current) === asBool(value) : String(current ?? "") === String(value);
		if (!same) changes[field] = value;
	}

	return changes;
}

export function fromRouterRow(row) {
	const rate = parseRateLimit(row["rate-limit"]);
	if (!rate) return null;

	return {
		name: row.name,
		...rate,
		sharedUsers: Number(row["shared-users"] ?? 1) || 1,
		macCookieTimeout: row["mac-cookie-timeout"] || "3d",
		idleTimeout: row["idle-timeout"] || "none",
		statusAutorefresh: row["status-autorefresh"] || "1m",
		addMacCookie: row["add-mac-cookie"] === undefined ? true : asBool(row["add-mac-cookie"]),
		transparentProxy: row["transparent-proxy"] === undefined ? true : asBool(row["transparent-proxy"]),
		openStatusPage: row["open-status-page"] || "always",
		advertise: asBool(row.advertise)
	};
}
