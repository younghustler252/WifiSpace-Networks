// infrastructure/jobs/queues/payment-cleanup.queue.js

import { Queue } from "bullmq";
import { connection } from "../connection.js";

export const paymentCleanupQueue = new Queue("payment-cleanup", {
    connection,
});

export async function registerPaymentCleanupJob() {
    await paymentCleanupQueue.upsertJobScheduler(
        "payment-cleanup-scheduler",
        {
            pattern: "0 2 * * *", // Every day at 2 AM
        },
        {
            name: "cleanup-expired-payments",
            data: {},
            opts: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 30000,
                },
                removeOnComplete: 20,
                removeOnFail: 50,
            },
        }
    );

    console.log("✅ Payment cleanup scheduler registered");
}