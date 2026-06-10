// mappers/notification.mapper.js

import { Notification } from "../../domain/entities/notification.entity.js";

export class NotificationMapper {

    // ================= TO DOMAIN =================

    static toDomain(raw) {

        if (!raw) return null;

        return new Notification({

            id: raw._id?.toString(),

            accountId: raw.accountId?.toString(),

            subscriptionId: raw.subscriptionId?.toString(),

            createdByAdminId: raw.createdByAdminId?.toString(),

            type: raw.type,

            title: raw.title,

            message: raw.message,

            channel: raw.channel,

            state: raw.state,

            metadata: raw.metadata,

            sentAt: raw.sentAt,

            completedAt: raw.completedAt,

            cancelledAt: raw.cancelledAt,

            isArchived: raw.isArchived,

            createdAt: raw.createdAt,

            updatedAt: raw.updatedAt
        });
    }


    // ================= TO PERSISTENCE =================

    static toPersistence(notification) {

        return {

            accountId: notification.accountId,

            subscriptionId: notification.subscriptionId,

            createdByAdminId: notification.createdByAdminId,

            type: notification.type,

            title: notification.title,

            message: notification.message,

            channel: notification.channel,

            state: notification.state,

            metadata: notification.metadata,

            sentAt: notification.sentAt,

            completedAt: notification.completedAt,

            cancelledAt: notification.cancelledAt,

            isArchived: notification.isArchived
        };
    }
}