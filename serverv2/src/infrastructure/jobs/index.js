// infrastructure/jobs/index.js

import { registerRouterSyncJob } from "./queues/router-sync.queue.js";
import { createRouterSyncWorker } from "./workers/router-sync.worker.js";

export async function startJobs() {
    await registerRouterSyncJob();

    createRouterSyncWorker();

    console.log("✅ Background jobs started");
}