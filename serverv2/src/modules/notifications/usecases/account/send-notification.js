// application/usecases/notification/sendNotification.usecase.js

import {
    NOTIFICATION_RECIPIENT_STATUS,
    NOTIFICATION_STATE
} from "../../../domain/notification.enum.js";


export class SendNotificationUseCase {

    constructor({

        notificationRepository,

        notificationRecipientRepository,

        userRepository,

        mailService

    }) {

        this.notificationRepository = notificationRepository;

        this.notificationRecipientRepository =
            notificationRecipientRepository;

        this.userRepository = userRepository;

        this.mailService = mailService;
    }


    /**
     * Send notification to a recipient
     * @param {string} recipientId
     */

    async execute(recipientId) {

        // ================= LOAD RECIPIENT =================

        const recipient =
            await this.notificationRecipientRepository.findById(
                recipientId
            );

        if (!recipient) {
            throw new Error("Recipient not found");
        }


        // ================= VALIDATE STATUS =================

        if (
            recipient.status !==
            NOTIFICATION_RECIPIENT_STATUS.QUEUED
        ) {
            throw new Error(
                `Recipient is not queued`
            );
        }


        // ================= LOAD NOTIFICATION =================

        const notification =
            await this.notificationRepository.findById(
                recipient.notificationId
            );

        if (!notification) {
            throw new Error("Notification not found");
        }


        // ================= LOAD USER =================

        const user =
            await this.userRepository.findById(
                recipient.userId
            );

        if (!user) {

            recipient.markAsFailed("User not found");

            await this.notificationRecipientRepository.update(
                recipient.id,
                recipient
            );

            throw new Error("User not found");
        }


        // ================= START PROCESSING =================

        notification.startProcessing();

        await this.notificationRepository.update(
            notification.id,
            notification
        );


        try {

            // ================= SEND EMAIL =================

            const providerResponse =
                await this.mailService.sendNotification({

                    to: user.email,

                    name: user.firstName,

                    subject: notification.title,

                    message: notification.message
                });


            // ================= MARK AS SENT =================

            recipient.markAsSent(
                providerResponse?.messageId || null
            );

            recipient.providerResponse =
                providerResponse || null;


            // ================= MARK AS DELIVERED =================
            // For email we usually assume delivered
            // unless webhook later says failed

            recipient.markAsDelivered();


            // ================= SAVE RECIPIENT =================

            await this.notificationRecipientRepository.update(
                recipient.id,
                recipient
            );


            // ================= COMPLETE NOTIFICATION =================

            notification.complete();

            await this.notificationRepository.update(
                notification.id,
                notification
            );


            return recipient;

        } catch (error) {

            // ================= HANDLE FAILURE =================

            recipient.markAsFailed(error.message);

            // retry scheduling
            if (recipient.canRetry()) {

                recipient.nextRetryAt = new Date(
                    Date.now() + (5 * 60 * 1000)
                );
            }

            await this.notificationRecipientRepository.update(
                recipient.id,
                recipient
            );


            throw error;
        }
    }
}