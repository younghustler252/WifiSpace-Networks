export class GetUserNotificationsUseCase {
    constructor({ notificationRepo }) {
        this.notificationRepo = notificationRepo;
    }

    /**
     * @param {Object} params
     * @param {string} params.userId
     * @param {string} [params.status]
     * @param {string} [params.type]
     * @param {number} [params.limit]
     * @param {number} [params.skip]
     */
    async execute({ userId, status, type, limit = 50, skip = 0 }) {
        return this.notificationRepo.getByUser(userId, { status, type, limit, skip });
    }
}