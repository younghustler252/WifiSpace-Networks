// application/usecases/notification/getUnreadNotifications.usecase.js

export class GetUnreadNotificationsUseCase {

    constructor({
        notificationRecipientRepository
    }) {

        this.notificationRecipientRepository =
            notificationRecipientRepository;
    }


    async execute(userId) {

        if (!userId) {
            throw new Error("userId is required");
        }

        const notifications =
            await this.notificationRecipientRepository
                .findUnreadByUser(userId);


        return {

            total: notifications.length,

            data: notifications
        };
    }
}