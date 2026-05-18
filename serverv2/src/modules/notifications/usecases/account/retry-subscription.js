export class RetryNotificationUseCase {
    constructor({ notificationRepo, notificationSender }) {
        this.notificationRepo = notificationRepo;
        this.notificationSender = notificationSender;
    }

    /**
     * @param {string} notificationId
     */
    async execute(notificationId) {
        const notification = await this.notificationRepo.findById(notificationId);
        if (!notification) throw new Error("Notification not found");
        if (notification.status !== "failed") throw new Error("Notification is not failed");

        return this.notificationSender.send(notification);
    }
}