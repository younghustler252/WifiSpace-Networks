import { NotificationRecipient } from "../domain/notification-recipient.entity.js";

const FIELDS = [
    "channel",
    "priority",
    "status",
    "retryCount",
    "maxRetries",
    "nextRetryAt",
    "queuedAt",
    "sentAt",
    "deliveredAt",
    "readAt",
    "failedAt",
    "cancelledAt",
    "failedReason",
    "providerMessageId",
    "providerResponse",
    "metadata",
    "isArchived",
];

export class NotificationRecipientMapper {
    static toDomain(raw) {
        if (!raw) return null;
        const data = {
            id: raw._id?.toString() || raw.id,
            notificationId: raw.notificationId?.toString(),
            userId: raw.userId?._id?.toString() || raw.userId?.toString(),
            createdAt: raw.createdAt, updatedAt: raw.updatedAt
        };
        for (const f of FIELDS) data[f] = raw[f];
        data.recipient = raw.userId && typeof raw.userId === "object" ? raw.userId : null;
        return new NotificationRecipient(data);
    }

    static toPersistence(r) {
        const data = {
            notificationId: r.notificationId,
            userId: r.userId,
        };

        for (const f of FIELDS) {
            data[f] = r[f];
        }

        return Object.fromEntries(
            Object.entries(data).filter(([, v]) => v !== undefined)
        );
    }
}
