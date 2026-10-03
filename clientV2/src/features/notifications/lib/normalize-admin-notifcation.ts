import type { AdminNotification } from "../types/notifications.types";

type Raw = Record<string, unknown>;

const str = (value: unknown) => (typeof value === "string" ? value : undefined);
const num = (value: unknown) => (typeof value === "number" ? value : undefined);

function recipientCount(raw: Raw) {
	const stats = (raw.stats ?? {}) as Raw;
	const direct = num(raw.recipientCount) ?? num(raw.totalRecipients) ?? num(raw.recipientsCount) ?? num(stats.total);
	if (direct !== undefined) return direct;
	if (Array.isArray(raw.userIds)) return raw.userIds.length;
	if (Array.isArray(raw.recipients)) return raw.recipients.length;
	return undefined;
}

export function normalizeAdminNotification(raw: Raw): AdminNotification {
	const metadata = (raw.metadata ?? {}) as Raw;

	return {
		id: String(raw.id ?? ""),
		type: str(raw.type) ?? null,
		title: str(raw.title) ?? str(metadata.title) ?? "Untitled",
		message: str(raw.message) ?? str(metadata.message) ?? "",
		state: str(raw.state) ?? str(raw.status) ?? "",
		priority: str(raw.priority),
		channel: str(raw.channel),
		recipientCount: recipientCount(raw),
		createdAt: str(raw.createdAt) ?? "",
	};
}