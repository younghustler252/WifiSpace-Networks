// infrastructure/jobs/queues/router-sync.queue.js

import { Queue } from "bullmq";
import { connection } from "../connection.js";

export const routerSyncQueue = new Queue("router-sync", {
    connection,
});

export async function registerRouterSyncJob() {
    await routerSyncQueue.upsertJobScheduler(
        "nightly-router-sync",
        {
            pattern: "*/2 * * * *", // Every 2 minutes
        },
        {
            name: "sync-all-routers",
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

    console.log("✅ Router sync scheduler registered");
}