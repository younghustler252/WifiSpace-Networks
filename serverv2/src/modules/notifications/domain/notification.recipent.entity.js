// domain/entities/notificationRecipient.entity.js

import {
    NOTIFICATION_CHANNEL,
    NOTIFICATION_PRIORITY,
    NOTIFICATION_RECIPIENT_STATUS
} from "../notification.enum.js";

export class NotificationRecipient {

    /**
     * @param {Object} props
     */

    constructor({

        id,

        notificationId,

        userId,

        channel,

        priority = NOTIFICATION_PRIORITY.NORMAL,

        status = NOTIFICATION_RECIPIENT_STATUS.PENDING,

        retryCount = 0,

        maxRetries = 3,

        nextRetryAt = null,

        queuedAt = null,

        sentAt = null,

        deliveredAt = null,

        readAt = null,

        failedAt = null,

        cancelledAt = null,

        failedReason = null,

        providerMessageId = null,

        providerResponse = null,

        metadata = {},

        isArchived = false,

        createdAt = new Date(),

        updatedAt = new Date()

    }) {

        // ================= REQUIRED =================

        if (!notificationId) {
            throw new Error("notificationId is required");
        }

        if (!userId) {
            throw new Error("userId is required");
        }


        // ================= VALIDATIONS =================

        if (!Object.values(NOTIFICATION_CHANNEL).includes(channel)) {
            throw new Error(`Invalid notification channel: ${channel}`);
        }

        if (!Object.values(NOTIFICATION_PRIORITY).includes(priority)) {
            throw new Error(`Invalid notification priority: ${priority}`);
        }

        if (!Object.values(NOTIFICATION_RECIPIENT_STATUS).includes(status)) {
            throw new Error(`Invalid recipient status: ${status}`);
        }


        // ================= PROPERTIES =================

        this.id = id;

        this.notificationId = notificationId;

        this.userId = userId;

        this.channel = channel;

        this.priority = priority;

        this.status = status;

        this.retryCount = retryCount;

        this.maxRetries = maxRetries;

        this.nextRetryAt = nextRetryAt;

        this.queuedAt = queuedAt;

        this.sentAt = sentAt;

        this.deliveredAt = deliveredAt;

        this.readAt = readAt;

        this.failedAt = failedAt;

        this.cancelledAt = cancelledAt;

        this.failedReason = failedReason;

        this.providerMessageId = providerMessageId;

        this.providerResponse = providerResponse;

        this.metadata = metadata;

        this.isArchived = isArchived;

        this.createdAt = createdAt;

        this.updatedAt = updatedAt;
    }


    // ================= BUSINESS METHODS =================

    queue() {

        this.status = NOTIFICATION_RECIPIENT_STATUS.QUEUED;

        this.queuedAt = new Date();

        this.updatedAt = new Date();
    }

    markAsSent(providerMessageId = null) {

        this.status = NOTIFICATION_RECIPIENT_STATUS.SENT;

        this.sentAt = new Date();

        this.providerMessageId = providerMessageId;

        this.updatedAt = new Date();
    }

    markAsDelivered() {

        this.status = NOTIFICATION_RECIPIENT_STATUS.DELIVERED;

        this.deliveredAt = new Date();

        this.updatedAt = new Date();
    }

    markAsRead() {

        this.status = NOTIFICATION_RECIPIENT_STATUS.READ;

        this.readAt = new Date();

        this.updatedAt = new Date();
    }

    markAsFailed(reason = null) {

        this.status = NOTIFICATION_RECIPIENT_STATUS.FAILED;

        this.failedAt = new Date();

        this.failedReason = reason;

        this.retryCount += 1;

        // exponential backoff
        const delayMinutes =
            Math.pow(2, this.retryCount);

        this.nextRetryAt = new Date(
            Date.now() + (delayMinutes * 60 * 1000)
        );

        this.updatedAt = new Date();
    }
    cancel() {

        this.status = NOTIFICATION_RECIPIENT_STATUS.CANCELLED;

        this.cancelledAt = new Date();

        this.updatedAt = new Date();
    }

    archive() {

        this.isArchived = true;

        this.updatedAt = new Date();
    }

    canRetry() {

        return this.retryCount < this.maxRetries;
    }
    retry() {

        this.status =
            NOTIFICATION_RECIPIENT_STATUS.QUEUED;

        this.failedReason = null;

        this.failedAt = null;

        this.nextRetryAt = null;

        this.queuedAt = new Date();

        this.updatedAt = new Date();
    }
}