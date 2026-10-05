// infrastructure/jobs/workers/router-sync.worker.js
import { Worker } from "bullmq";
import { connection } from "../connection.js";
import { container } from "../../../container/index.js";
import { attachWorkerLifecycleLogging } from "../worker-events.js";

export function createRouterSyncWorker() {
	const worker = new Worker(
		"router-sync",
		async () => {
			const syncAllRouters = container.resolve("syncAllRouters");
			const result = await syncAllRouters.execute();
			console.log(`Router sync: total ${result.total}, synced ${result.synced}, failed ${result.failed}`);
		},
		{ connection, concurrency: 1 }
	);
	// attachWorkerLifecycleLogging(worker, "router-sync", { notifyOnFailure: true });
	return worker;
}