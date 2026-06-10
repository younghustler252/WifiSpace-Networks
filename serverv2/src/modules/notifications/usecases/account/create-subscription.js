
import { Notification } from "../../domain/entities/notification.entity.js";

import { NotificationRecipient } from "../../domain/entities/notificationRecipient.entity.js";

import {
    NOTIFICATION_STATE,
    NOTIFICATION_RECIPIENT_STATUS,
    NOTIFICATION_PRIORITY
} from "../../../domain/notification.enum.js";


export class CreateNotificationUseCase {

    constructor({
        notificationRepository,
        notificationRecipientRepository
    }) {

        this.notificationRepository = notificationRepository;

        this.notificationRecipientRepository = notificationRecipientRepository;
    }


    /**
     * @param {Object} payload
     */

    async execute({

        accountId = null,

        subscriptionId = null,

        createdByAdminId = null,

        type,

        title,

        message,

        channel,

        metadata = {},

        recipients = [],

        priority = NOTIFICATION_PRIORITY.NORMAL

    }) {

        // ================= VALIDATIONS =================

        if (!Array.isArray(recipients) || recipients.length === 0) {
            throw new Error("Recipients are required");
        }


        // ================= CREATE NOTIFICATION ENTITY =================

        const notificationEntity = new Notification({

            accountId,

            subscriptionId,

            createdByAdminId,

            type,

            title,

            message,

            channel,

            metadata,

            state: NOTIFICATION_STATE.QUEUED
        });


        // ================= SAVE NOTIFICATION =================

        const createdNotification =
            await this.notificationRepository.create(
                notificationEntity
            );


        // ================= CREATE RECIPIENT ENTITIES =================

        const recipientEntities = recipients.map(userId => {

            const recipient = new NotificationRecipient({

                notificationId: createdNotification.id,

                userId,

                channel,

                priority,

                status: NOTIFICATION_RECIPIENT_STATUS.PENDING,

                metadata
            });

            recipient.queue();

            return recipient;
        });


        // ================= SAVE RECIPIENTS =================

        const createdRecipients =
            await this.notificationRecipientRepository.createMany(
                recipientEntities
            );


        // ================= RETURN =================

        return {

            notification: createdNotification,

            recipients: createdRecipients
        };
    }
}