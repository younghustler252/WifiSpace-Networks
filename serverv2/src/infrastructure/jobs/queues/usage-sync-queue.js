// infrastructure/jobs/queues/usage-sync.queue.js
import { Queue } from "bullmq";
import { connection } from "../connection.js";

export const usageSyncQueue = new Queue("usage-sync", { connection });

export async function registerUsageSyncJob() {
	await usageSyncQueue.upsertJobScheduler(
		"usage-sync-scheduler",
		{ pattern: "*/5 * * * *" }, // every 5 minutes
		{ name: "sync-usage", data: {}, opts: { attempts: 2, backoff: { type: "exponential", delay: 15000 }, removeOnComplete: 20, removeOnFail: 50 } }
	);
	console.log("✅ Usage sync scheduler registered");
}