// infrastructure/jobs/workers/usage-sync.worker.js
import { Worker } from "bullmq";
import { connection } from "../connection.js";
import { container } from "../../../container/index.js";
import { attachWorkerLifecycleLogging } from "../worker-events.js";

export function createUsageSyncWorker() {
	const worker = new Worker(
		"usage-sync",
		async () => {
			const syncUsage = container.resolve("syncUsage");
			const result = await syncUsage.execute();
			console.log(`Usage sync: checked ${result.checked}, synced ${result.synced}, failed ${result.failed}, skipped ${result.skipped}`);
		},
		{ connection, concurrency: 1 }
	);
	attachWorkerLifecycleLogging(worker, "usage-sync", { notifyOnFailure: true });
	return worker;
}