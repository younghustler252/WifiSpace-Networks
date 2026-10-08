// infrastructure/jobs/workers/provisioning.worker.js
import { Worker } from "bullmq";
import { connection } from "../connection.js";
import { container } from "../../../container/index.js";
import { attachWorkerLifecycleLogging } from "../worker-events.js";

export function createProvisioningWorker() {
	const worker = new Worker(
		"provisioning",
		async (job) => container.resolve("provisionSubscription").execute(job.data),
		{ connection, concurrency: 5 }
	);
	attachWorkerLifecycleLogging(worker, "provisioning", { notifyOnFailure: false });
	return worker;
}