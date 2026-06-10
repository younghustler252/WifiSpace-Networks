// application/usecases/notification/processNotificationQueue.usecase.js

export class ProcessNotificationQueueUseCase {

    constructor({

        notificationRecipientRepository,

        sendNotificationUseCase

    }) {

        this.notificationRecipientRepository =
            notificationRecipientRepository;

        this.sendNotificationUseCase =
            sendNotificationUseCase;
    }


    /**
     * Process queued notifications
     */

    async execute({

        limit = 50

    } = {}) {

        // ================= LOAD QUEUED RECIPIENTS =================

        const recipients =
            await this.notificationRecipientRepository
                .findQueuedRecipients(limit);


        // ================= EMPTY =================

        if (!recipients.length) {

            return {

                total: 0,

                success: 0,

                failed: 0,

                results: []
            };
        }


        // ================= PROCESS =================

        let success = 0;

        let failed = 0;

        const results = [];


        for (const recipient of recipients) {

            try {

                const processed =
                    await this.sendNotificationUseCase.execute(
                        recipient.id
                    );

                success++;

                results.push({

                    recipientId: recipient.id,

                    success: true,

                    status: processed.status
                });

            } catch (error) {

                failed++;

                results.push({

                    recipientId: recipient.id,

                    success: false,

                    error: error.message
                });
            }
        }


        // ================= RETURN =================

        return {

            total: recipients.length,

            success,

            failed,

            results
        };
    }
}