import type { NotificationRecipientRow } from "../types/notifications.types";

type Raw = Record<string, unknown>;

const str = (value: unknown) => (typeof value === "string" ? value : undefined);

export function normalizeRecipient(raw: Raw): NotificationRecipientRow {
	const candidate = raw.user ?? raw.recipient ?? raw.userId;
	const person = candidate && typeof candidate === "object" ? (candidate as Raw) : null;
	const name = person ? `${str(person.firstName) ?? ""} ${str(person.lastName) ?? ""}`.trim() : "";
	const fallbackId = typeof raw.userId === "string" ? raw.userId : "";

	return {
		id: String(raw.id ?? ""),
		name: name || str(person?.email) || (fallbackId ? `…${fallbackId.slice(-6)}` : "Unknown"),
		email: str(person?.email) ?? null,
		channel: str(raw.channel) ?? null,
		status: str(raw.status) ?? "",
		failedReason: str(raw.failedReason) ?? null,
		providerMessageId: str(raw.providerMessageId) ?? null,
	};
}