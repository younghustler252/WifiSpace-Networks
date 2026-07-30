// infrastructure/jobs/index.js

import { registerRouterSyncJob } from "./queues/router-sync.queue.js";
import { registerPaymentExpiryJob } from "./queues/payment-expiry.queue.js";

import { createRouterSyncWorker } from "./workers/router-sync.worker.js";
import { createPaymentExpiryWorker } from "./workers/payment-expiry.worker.js";

import { registerPaymentCleanupJob } from "./queues/payment-cleanup.queue.js";
import { createPaymentCleanupWorker } from "./workers/payment-cleanup.worker.js";

import { registerSubscriptionExpiryJob } from "./queues/subscription-expiry.queue.js";
import { createSubscriptionExpiryWorker } from "./workers/subscription-expiry.worker.js";

export async function startJobs() {
    // Register repeatable jobs
    await registerRouterSyncJob();
    await registerPaymentExpiryJob();
    await registerPaymentCleanupJob();
    await registerSubscriptionExpiryJob()

    // Start workers
    createRouterSyncWorker();
    createPaymentExpiryWorker();
    createPaymentCleanupWorker();
    createSubscriptionExpiryWorker()

    console.log("✅ Background jobs started");
}