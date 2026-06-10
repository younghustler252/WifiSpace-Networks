// domain/entities/notification.entity.js

import {
    NOTIFICATION_TYPES,
    NOTIFICATION_CHANNEL,
    NOTIFICATION_STATE
} from "../notification.enum.js";

export class Notification {

    /**
     * @param {Object} props
     */

    constructor({
        id,

        accountId = null,

        subscriptionId = null,

        createdByAdminId = null,

        type,

        title,

        message,

        channel = NOTIFICATION_CHANNEL.EMAIL,

        state = NOTIFICATION_STATE.QUEUED,

        metadata = {},

        sentAt = null,

        completedAt = null,

        cancelledAt = null,

        isArchived = false,

        createdAt = new Date(),

        updatedAt = new Date()

    }) {

        this.id = id;

        this.accountId = accountId;

        this.subscriptionId = subscriptionId;

        this.createdByAdminId = createdByAdminId;


        // ================= VALIDATIONS =================

        if (!Object.values(NOTIFICATION_TYPES).includes(type)) {
            throw new Error(`Invalid notification type: ${type}`);
        }

        if (!Object.values(NOTIFICATION_CHANNEL).includes(channel)) {
            throw new Error(`Invalid notification channel: ${channel}`);
        }

        if (!Object.values(NOTIFICATION_STATE).includes(state)) {
            throw new Error(`Invalid notification state: ${state}`);
        }

        if (!title?.trim()) {
            throw new Error("Notification title is required");
        }

        if (!message?.trim()) {
            throw new Error("Notification message is required");
        }


        // ================= PROPERTIES =================

        this.type = type;

        this.title = title;

        this.message = message;

        this.channel = channel;

        this.state = state;

        this.metadata = metadata;

        this.sentAt = sentAt;

        this.completedAt = completedAt;

        this.cancelledAt = cancelledAt;

        this.isArchived = isArchived;

        this.createdAt = createdAt;

        this.updatedAt = updatedAt;
    }


    // ================= BUSINESS METHODS =================

    queue() {

        this.state = NOTIFICATION_STATE.QUEUED;

        this.updatedAt = new Date();
    }

    startProcessing() {

        this.state = NOTIFICATION_STATE.PROCESSING;

        this.updatedAt = new Date();
    }

    complete() {

        this.state = NOTIFICATION_STATE.COMPLETED;

        this.completedAt = new Date();

        this.updatedAt = new Date();
    }

    cancel() {

        this.state = NOTIFICATION_STATE.CANCELLED;

        this.cancelledAt = new Date();

        this.updatedAt = new Date();
    }

    archive() {

        this.isArchived = true;

        this.updatedAt = new Date();
    }
}