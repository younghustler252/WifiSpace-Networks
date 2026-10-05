// infrastructure/jobs/queues/router-sync.queue.js
import { Queue } from "bullmq";
import { connection } from "../connection.js";

export const routerSyncQueue = new Queue("router-sync", { connection });

export async function registerRouterSyncJob() {
	await routerSyncQueue.upsertJobScheduler(
		"router-sync-scheduler",
		{ pattern: "*/5 * * * *" },
		{ name: "sync-all-routers", data: {}, opts: { attempts: 2, backoff: { type: "exponential", delay: 15000 }, removeOnComplete: 20, removeOnFail: 50 } }
	);
	console.log("✅ Router sync scheduler registered");
}