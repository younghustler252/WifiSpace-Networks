// application/usecases/notification/getUserNotifications.usecase.js

export class GetUserNotificationsUseCase {

    constructor({
        notificationRecipientRepository
    }) {

        this.notificationRecipientRepository =
            notificationRecipientRepository;
    }


    async execute({

        userId,

        status,

        channel,

        page = 1,

        limit = 20

    }) {

        if (!userId) {
            throw new Error("userId is required");
        }

        return await this.notificationRecipientRepository
            .findByUser(userId, {
                status,
                channel,
                page,
                limit
            });
    }
}