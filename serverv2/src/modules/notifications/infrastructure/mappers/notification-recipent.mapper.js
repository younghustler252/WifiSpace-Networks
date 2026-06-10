// mappers/notificationRecipient.mapper.js

import { NotificationRecipient } from "../../domain/entities/notificationRecipient.entity.js";

export class NotificationRecipientMapper {

    // ================= TO DOMAIN =================

    static toDomain(raw) {

        if (!raw) return null;

        return new NotificationRecipient({

            id: raw._id?.toString(),

            notificationId: raw.notificationId?.toString(),

            userId: raw.userId?.toString(),

            channel: raw.channel,

            priority: raw.priority,

            status: raw.status,

            retryCount: raw.retryCount,

            maxRetries: raw.maxRetries,

            nextRetryAt: raw.nextRetryAt,

            queuedAt: raw.queuedAt,

            sentAt: raw.sentAt,

            deliveredAt: raw.deliveredAt,

            readAt: raw.readAt,

            failedAt: raw.failedAt,

            cancelledAt: raw.cancelledAt,

            failedReason: raw.failedReason,

            providerMessageId: raw.providerMessageId,

            providerResponse: raw.providerResponse,

            metadata: raw.metadata,

            isArchived: raw.isArchived,

            createdAt: raw.createdAt,

            updatedAt: raw.updatedAt
        });
    }


    // ================= TO PERSISTENCE =================

    static toPersistence(recipient) {

        return {

            notificationId: recipient.notificationId,

            userId: recipient.userId,

            channel: recipient.channel,

            priority: recipient.priority,

            status: recipient.status,

            retryCount: recipient.retryCount,

            maxRetries: recipient.maxRetries,

            nextRetryAt: recipient.nextRetryAt,

            queuedAt: recipient.queuedAt,

            sentAt: recipient.sentAt,

            deliveredAt: recipient.deliveredAt,

            readAt: recipient.readAt,

            failedAt: recipient.failedAt,

            cancelledAt: recipient.cancelledAt,

            failedReason: recipient.failedReason,

            providerMessageId: recipient.providerMessageId,

            providerResponse: recipient.providerResponse,

            metadata: recipient.metadata,

            isArchived: recipient.isArchived
        };
    }
}