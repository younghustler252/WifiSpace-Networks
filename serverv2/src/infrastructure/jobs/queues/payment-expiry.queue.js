// infrastructure/jobs/queues/payment-expiry.queue.js

import { Queue } from "bullmq";
import { connection } from "../connection.js";

export const paymentExpiryQueue = new Queue("payment-expiry", {
    connection,
});

export async function registerPaymentExpiryJob() {
    await paymentExpiryQueue.upsertJobScheduler(
        "payment-expiry-scheduler",
        {
            pattern: "*/1 * * * *", // Every minute
        },
        {
            name: "expire-pending-payments",
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

    console.log("✅ Payment expiry scheduler registered");
}