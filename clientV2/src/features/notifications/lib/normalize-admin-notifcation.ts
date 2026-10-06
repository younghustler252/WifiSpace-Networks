import type { AdminNotification } from "../types/notifications.types";

type Raw = Record<string, unknown>;

const str = (value: unknown) => (typeof value === "string" ? value : undefined);
const num = (value: unknown) => (typeof value === "number" ? value : undefined);

function recipientCount(raw: Raw) {
	const stats = (raw.stats ?? {}) as Raw;
	const direct = num(raw.recipientCount) ?? num(raw.totalRecipients) ?? num(raw.recipientsCount) ?? num(stats.total);
	if (direct !== undefined) return direct;
	if (Array.isArray(raw.userIds)) return raw.userIds.length;
	return undefined;
}

function adminName(raw: unknown) {
	const admin = raw && typeof raw === "object" ? (raw as Raw) : null;
	if (!admin) return null;
	return `${str(admin.firstName) ?? ""} ${str(admin.lastName) ?? ""}`.trim() || str(admin.email) || null;
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
		sentBy: adminName(raw.createdByAdmin),
		createdAt: str(raw.createdAt) ?? "",
	};
}