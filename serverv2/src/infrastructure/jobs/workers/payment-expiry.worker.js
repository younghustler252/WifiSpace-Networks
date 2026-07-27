// infrastructure/jobs/workers/payment-expiry.worker.js

import { Worker } from "bullmq";
import { connection } from "../connection.js";
import { container } from "../../../container/index.js";

export function createPaymentExpiryWorker() {
    return new Worker(
        "payment-expiry",
        async () => {
            console.log("Checking for expired pending payments...");

            const { expirePendingPayments } = container.cradle;

            const result = await expirePendingPayments.execute();

            console.log(
                `Expired ${result.expiredCount} pending payment(s)`
            );
        },
        {
            connection,
            concurrency: 1,
        }
    );
}