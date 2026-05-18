import { NOTIFICATION_STATUS, NOTIFICATION_TYPES, NOTIFICATION_CHANNEL } from "./notification.enum.js";

export class Notification {
    /**
     * @param {Object} props
     * @param {string} props.id - unique ID
     * @param {string} [props.userId] - single user target
     * @param {string[]} [props.targetUsers] - multiple user targets (admin broadcasts)
     * @param {string} [props.accountId]
     * @param {string} [props.subscriptionId]
     * @param {string} [props.createdByAdminId]
     * @param {string} props.type - type of notification
     * @param {string} props.title
     * @param {string} props.message
     * @param {string} props.channel - channel to send notification
     * @param {string} [props.status]
     * @param {Object} [props.metadata]
     * @param {Date} [props.sentAt]
     * @param {Date} [props.createdAt]
     * @param {Date} [props.updatedAt]
     */
    constructor({
        id,
        userId = null,
        targetUsers = [],
        accountId = null,
        subscriptionId = null,
        createdByAdminId = null,
        type,
        title,
        message,
        channel = NOTIFICATION_CHANNEL.EMAIL,
        status = NOTIFICATION_STATUS.UNREAD,
        metadata = {},
        sentAt = null,
        createdAt = new Date(),
        updatedAt = new Date()
    }) {
        this.id = id;
        this.userId = userId;
        this.targetUsers = targetUsers;
        this.accountId = accountId;
        this.subscriptionId = subscriptionId;
        this.createdByAdminId = createdByAdminId;

        if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
            throw new Error(`Invalid notification type: ${type}`);
        }
        this.type = type;

        this.title = title;
        this.message = message;

        if (!Object.values(NOTIFICATION_CHANNEL).includes(channel)) {
            throw new Error(`Invalid notification channel: ${channel}`);
        }
        this.channel = channel;

        if (!Object.values(NOTIFICATION_STATUS).includes(status)) {
            throw new Error(`Invalid notification status: ${status}`);
        }
        this.status = status;

        this.metadata = metadata;
        this.sentAt = sentAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    markAsRead() {
        this.status = NOTIFICATION_STATUS.READ;
        this.updatedAt = new Date();
    }

    markAsSent() {
        this.status = NOTIFICATION_STATUS.SENT;
        this.sentAt = new Date();
        this.updatedAt = new Date();
    }

    markAsFailed() {
        this.status = NOTIFICATION_STATUS.FAILED;
        this.updatedAt = new Date();
    }
}