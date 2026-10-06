import { NOTIFICATION_RECIPIENT_STATUS } from "../constants";
import type { NotificationItem } from "../types/notifications.types";

type Raw = Record<string, unknown>;

const str = (value: unknown) => (typeof value === "string" ? value : undefined);

function humanize(type: string | null) {
	if (!type) return undefined;
	const text = type.replace(/_/g, " ");
	return text.charAt(0).toUpperCase() + text.slice(1);
}

export function normalizeNotification(raw: Raw): NotificationItem {
	const metadata = (raw.metadata ?? {}) as Raw;
	const type = str(metadata.type) ?? str(raw.type) ?? null;
	const status = str(raw.status) ?? NOTIFICATION_RECIPIENT_STATUS.SENT;
	const readAt = str(raw.readAt) ?? null;

	return {
		id: String(raw.id ?? ""),
		type,
		title: str(metadata.title) ?? humanize(type) ?? "Notification",
		message: str(metadata.message) ?? "",
		status,
		channel: str(raw.channel),
		priority: str(raw.priority),
		accountId: str(metadata.accountId) ?? null,
		entityType: str(metadata.entityType) ?? null,
		entityId: str(metadata.entityId) ?? null,
		createdAt: str(raw.createdAt) ?? "",
		readAt,
		isRead: status === NOTIFICATION_RECIPIENT_STATUS.READ || !!readAt,
	};
}