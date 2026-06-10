
import {
    NOTIFICATION_RECIPIENT_STATUS
} from "../../../domain/notification.enum.js";


export class MarkNotificationAsReadUseCase {

    constructor({
        notificationRecipientRepository
    }) {

        this.notificationRecipientRepository =
            notificationRecipientRepository;
    }


    async execute({

        recipientId,

        userId

    }) {

        // ================= LOAD =================

        const recipient =
            await this.notificationRecipientRepository
                .findById(recipientId);


        if (!recipient) {
            throw new Error("Notification recipient not found");
        }


        // ================= SECURITY =================

        if (
            recipient.userId.toString() !==
            userId.toString()
        ) {
            throw new Error(
                "Unauthorized notification access"
            );
        }


        // ================= ALREADY READ =================

        if (
            recipient.status ===
            NOTIFICATION_RECIPIENT_STATUS.READ
        ) {
            return recipient;
        }


        // ================= MARK AS READ =================

        recipient.markAsRead();


        // ================= SAVE =================

        return await this.notificationRecipientRepository
            .update(
                recipient.id,
                recipient
            );
    }
}