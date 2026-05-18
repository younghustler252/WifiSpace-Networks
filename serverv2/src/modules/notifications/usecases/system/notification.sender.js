import { NOTIFICATION_CHANNEL, NOTIFICATION_STATUS } from "../../domain/notification.enum.js";

export class NotificationSender {
    constructor() {
        this.mailService = mailService;
        this.notificationRepo = notificationRepository;
    }

    /**
     * Send a single notification entity
     * @param {Notification} notification
     */
    async send(notification) {
        try {
            if (notification.channel === NOTIFICATION_CHANNEL.EMAIL) {
                // For email, use MailService
                await this.mailService.sendNotification({
                    to: notification.metadata?.email || notification.userId, // resolve email
                    name: notification.metadata?.name || "",
                    subject: notification.title,
                    message: notification.message
                });
            } else if (notification.channel === NOTIFICATION_CHANNEL.WHATSAPP) {
                // TODO: integrate WhatsApp sending service
            } else if (notification.channel === NOTIFICATION_CHANNEL.SMS) {
                // TODO: integrate SMS sending service
            }

            // Mark notification as sent
            notification.markAsSent();
        } catch (error) {
            console.error("Notification sending failed:", error);
            notification.markAsFailed();
        }

        // Persist status update
        return this.notificationRepo.update(notification);
    }

    /**
     * Send multiple notifications in batch
     * @param {Notification[]} notifications
     */
    async sendBatch(notifications) {
        const results = [];
        for (const notification of notifications) {
            const result = await this.send(notification);
            results.push(result);
        }
        return results;
    }
}