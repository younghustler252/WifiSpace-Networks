// mappers/notification.mapper.js
import { Notification } from "../domain/notification.entity.js";
const FIELDS = [
	"accountId",
	"subscriptionId",
	"createdByAdminId",
	"entityType",
	"entityId",
	"type",
	"title",
	"message",
	"channel",
	"state",
	"metadata",
	"sentAt",
	"recipientCount",
	"completedAt",
	"cancelledAt",
	"isArchived",
];

export class NotificationMapper {
	static toDomain(raw) {
		if (!raw) return null;
		const data = { id: raw._id?.toString() || raw.id, createdAt: raw.createdAt, updatedAt: raw.updatedAt };
		for (const f of FIELDS) data[f] = raw[f];
		data.accountId = raw.accountId?.toString() ?? null;
		data.subscriptionId = raw.subscriptionId?.toString() ?? null;
		data.entityType = raw.entityType ?? null;
		data.entityId = raw.entityId?.toString() ?? null;

		data.createdByAdminId = raw.createdByAdminId?.toString() ?? null;
		return new Notification(data);
	}
	static toPersistence(n) {
		const data = {};
		for (const f of FIELDS) data[f] = n[f];
		return Object.fromEntries(Object.entries(data).filter(([, v]) => v !== undefined));
	}
}