// infrastructure/jobs/workers/router-sync.worker.js

import { Worker } from "bullmq";
import { connection } from "../connection.js";
import { container } from "../../../container/index.js";

export function createRouterSyncWorker() {
    return new Worker(
        "router-sync",
        async () => {
            console.log("Starting nightly router sync...");

            const { syncAllRouters } = container.cradle;

            const result = await syncAllRouters.execute();

            console.log(`Finished syncing ${result.length} routers`);
        },
        {
            connection,
            concurrency: 1,
        }
    );
}