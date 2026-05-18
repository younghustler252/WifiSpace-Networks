import { Notification } from "../../domain/notification.entity.js";
import { NOTIFICATION_STATUS } from "../../domain/notification.enum.js";

export class CreateNotificationUseCase {
    /**
     * @param {Object} deps
     * @param {NotificationRepository} deps.notificationRepo
     * @param {NotificationSender} deps.notificationSender
     */
    constructor({ notificationRepo, notificationSender }) {
        this.notificationRepo = notificationRepo;
        this.notificationSender = notificationSender;
    }

    /**
     * Create and optionally send a notification
     * @param {Object} params
     * @param {string} [params.userId] - single target
     * @param {string[]} [params.targetUsers] - broadcast target
     * @param {string} [params.createdByAdminId] - if admin created
     * @param {string} params.type
     * @param {string} params.title
     * @param {string} params.message
     * @param {string} params.channel
     * @param {Object} [params.metadata]
     * @param {boolean} [params.sendImmediately]
     * @returns {Promise<Notification[]>}
     */
    async execute({
        userId = null,
        targetUsers = [],
        createdByAdminId = null,
        type,
        title,
        message,
        channel,
        metadata = {},
        sendImmediately = true
    }) {
        const notifications = [];

        // Determine recipients
        const recipients = targetUsers.length > 0 ? targetUsers : [userId];

        for (const recipient of recipients) {
            const notification = new Notification({
                userId: recipient,
                targetUsers: targetUsers.length > 0 ? targetUsers : [],
                createdByAdminId,
                type,
                title,
                message,
                channel,
                metadata,
                status: NOTIFICATION_STATUS.UNREAD
            });

            // Save to DB
            const savedNotification = await this.notificationRepo.create(notification);
            notifications.push(savedNotification);

            // Send if requested
            if (sendImmediately) {
                await this.notificationSender.send(savedNotification);
            }
        }

        return notifications;
    }
}