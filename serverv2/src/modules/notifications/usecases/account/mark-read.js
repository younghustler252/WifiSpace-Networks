export class MarkNotificationReadUseCase {
    constructor({ notificationRepo }) {
        this.notificationRepo = notificationRepo;
    }

    /**
     * @param {Object} params
     * @param {string} [params.notificationId] - mark single
     * @param {string} [params.userId] - mark all for this user
     */
    async execute({ notificationId, userId }) {
        if (notificationId) {
            return this.notificationRepo.markAsRead(notificationId);
        }
        if (userId) {
            const count = await this.notificationRepo.markAllAsRead(userId);
            return { markedCount: count };
        }
        throw new Error("Either notificationId or userId must be provided");
    }
}