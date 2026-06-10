
export class RetryFailedNotificationsUseCase {

    constructor({

        notificationRecipientRepository,

        sendNotificationUseCase

    }) {

        this.notificationRecipientRepository =
            notificationRecipientRepository;

        this.sendNotificationUseCase =
            sendNotificationUseCase;
    }


    async execute({

        limit = 50

    } = {}) {

        // ================= LOAD FAILED =================

        const recipients =
            await this.notificationRecipientRepository
                .findFailedForRetry(limit);


        // ================= EMPTY =================

        if (!recipients.length) {

            return {

                total: 0,

                retried: 0,

                failed: 0,

                results: []
            };
        }


        let retried = 0;

        let failed = 0;

        const results = [];


        // ================= PROCESS =================

        for (const recipient of recipients) {

            try {

                // ================= VALIDATE RETRIES =================

                if (!recipient.canRetry()) {

                    failed++;

                    results.push({

                        recipientId: recipient.id,

                        success: false,

                        error: "Max retries exceeded"
                    });

                    continue;
                }


                // ================= REQUEUE =================

                recipient.retry();


                await this.notificationRecipientRepository.update(
                    recipient.id,
                    recipient
                );


                // ================= SEND AGAIN =================

                const processed =
                    await this.sendNotificationUseCase.execute(
                        recipient.id
                    );


                retried++;

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

            retried,

            failed,

            results
        };
    }
}