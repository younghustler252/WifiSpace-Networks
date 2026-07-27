// infrastructure/jobs/index.js

import { registerRouterSyncJob } from "./queues/router-sync.queue.js";
import { registerPaymentExpiryJob } from "./queues/payment-expiry.queue.js";

import { createRouterSyncWorker } from "./workers/router-sync.worker.js";
import { createPaymentExpiryWorker } from "./workers/payment-expiry.worker.js";

export async function startJobs() {
    // Register repeatable jobs
    await registerRouterSyncJob();
    await registerPaymentExpiryJob();

    // Start workers
    createRouterSyncWorker();
    createPaymentExpiryWorker();

    console.log("✅ Background jobs started");
}