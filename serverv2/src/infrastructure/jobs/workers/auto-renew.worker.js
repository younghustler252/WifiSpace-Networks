import { Worker } from "bullmq";
import { connection } from "../connection.js";
import { container } from "../../../container/index.js";
import { attachWorkerLifecycleLogging } from "../worker-events.js";

export function createAutoRenewWorker() {
	const worker = new Worker(
		"auto-renew",
		async () => {
			const result = await container.resolve("autoRenewSubscriptions").execute();
			if (result.renewed || result.failed) {
				console.log(`[auto-renew] checked ${result.checked}, renewed ${result.renewed}, failed ${result.failed}, skipped ${result.skipped}`);
			}
		},
		{ connection, concurrency: 1 }
	);

	attachWorkerLifecycleLogging(worker, "auto-renew", { notifyOnFailure: true });
	return worker;
}
