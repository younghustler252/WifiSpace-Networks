type Raw = Record<string, unknown>;

export function normalizeProfiles(raw: unknown): string[] {
	const list = Array.isArray(raw) ? raw : Array.isArray((raw as Raw | null)?.profiles) ? ((raw as Raw).profiles as unknown[]) : [];

	const names = list
		.map((item) => {
			if (typeof item === "string") return item;
			if (item && typeof item === "object") {
				const record = item as Raw;
				return record.name ?? record.profile;
			}
			return undefined;
		})
		.filter((name): name is string => typeof name === "string" && name.length > 0);

	return Array.from(new Set(names)).sort();
}