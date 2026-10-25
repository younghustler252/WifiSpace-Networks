const MARKER_PATTERN = /^wifispace:([a-f0-9]{24})/;

export const markerFor = (entry) => `wifispace:${entry.id}${entry.description ? ` ${entry.description}` : ""}`;
export const markerIdOf = (row) => MARKER_PATTERN.exec(row.comment ?? "")?.[1] ?? null;

const lower = (value) => String(value ?? "").toLowerCase();

export function contentKeyOfEntry(entry) {
	return entry.kind === "ip"
		? `ip|${entry.dstAddress ?? ""}|${lower(entry.dstHost)}|${lower(entry.protocol)}|${entry.dstPort ?? ""}`
		: `host|${lower(entry.dstHost)}|${entry.dstPort ?? ""}|${entry.path ?? ""}`;
}

export function contentKeyOfRow(kind, row) {
	return kind === "ip"
		? `ip|${row["dst-address"] ?? ""}|${lower(row["dst-host"])}|${lower(row.protocol)}|${row["dst-port"] ?? ""}`
		: `host|${lower(row["dst-host"])}|${row["dst-port"] ?? ""}|${row.path ?? ""}`;
}

export function toRouterFields(entry) {
	const fields = { action: entry.action, comment: markerFor(entry) };

	if (entry.kind === "ip") {
		if (entry.dstAddress) fields["dst-address"] = entry.dstAddress;
		if (entry.dstHost) fields["dst-host"] = entry.dstHost;
		if (entry.protocol) fields.protocol = entry.protocol;
		if (entry.dstPort) fields["dst-port"] = entry.dstPort;
	} else {
		fields["dst-host"] = entry.dstHost;
		if (entry.dstPort) fields["dst-port"] = entry.dstPort;
		if (entry.path) fields.path = entry.path;
	}

	return fields;
}

export function diffFields(desired, row) {
	const changes = {};
	for (const [field, value] of Object.entries(desired)) {
		if (String(row[field] ?? "") !== String(value)) changes[field] = value;
	}
	return changes;
}

export function entryFromRow(kind, row) {
	return {
		kind,
		dstHost: row["dst-host"] || null,
		dstAddress: row["dst-address"] || null,
		protocol: row.protocol || null,
		dstPort: row["dst-port"] || null,
		path: row.path || null,
		action: row.action || (kind === "ip" ? "accept" : "allow"),
		description: row.comment && !markerIdOf(row) ? row.comment : null,
		enabled: true
	};
}
