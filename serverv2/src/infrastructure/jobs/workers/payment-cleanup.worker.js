// infrastructure/jobs/workers/payment-cleanup.worker.js

import { Worker } from "bullmq";
import { connection } from "../connection.js";
import { container } from "../../../container/index.js";
import { attachWorkerLifecycleLogging } from "../worker-events.js";

export function createPaymentCleanupWorker() {
    const worker = new Worker(
        "payment-cleanup",
        async () => {
            console.log("Starting expired payment cleanup...");

            const paymentRepository =
                container.resolve("paymentRepository");

            const cutoffDate =
                new Date(
                    Date.now() - 30 * 24 * 60 * 60 * 1000
                );

            const result =
                await paymentRepository.deleteExpiredPayments(
                    cutoffDate
                );

            console.log(
                `Cleaned up ${result.deletedCount} expired payment(s)`
            );
        },
        {
            connection,
            concurrency: 1,
        }
    );

    // attachWorkerLifecycleLogging(worker, "payment-cleanup", {
    //     notifyOnFailure: true,
    // });

    return worker;
}
