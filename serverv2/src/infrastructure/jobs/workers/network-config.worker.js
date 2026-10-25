import { Worker } from "bullmq";
import { connection } from "../connection.js";
import { container } from "../../../container/index.js";
import { attachWorkerLifecycleLogging } from "../worker-events.js";

export function createNetworkConfigWorker() {
	const worker = new Worker(
		"network-config",
		async (job) => {
			if (job.data.all) {
				const queued = await container.resolve("networkConfigDispatcher").enqueueAll();
				console.log(`[network-config] queued sync for ${queued} router(s)`);
				return;
			}

			const result = await container.resolve("syncNetworkConfig").execute({ routerId: job.data.routerId, resources: "all" });
			const failed = (result.profiles?.failed?.length ?? 0) + (result.walledGarden?.failed?.length ?? 0);
			console.log(`[network-config] ${result.router}: ${result.error ?? (result.skipped ? `skipped (${result.skipped})` : `done, ${failed} failure(s)`)}`);
		},
		{ connection, concurrency: 2 }
	);

	attachWorkerLifecycleLogging(worker, "network-config", { notifyOnFailure: false });
	return worker;
}
