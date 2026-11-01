import { Queue } from "bullmq";
import { connection } from "../connection.js";

export const autoRenewQueue = new Queue("auto-renew", { connection });

export async function registerAutoRenewJob() {
	await autoRenewQueue.upsertJobScheduler(
		"auto-renew-scheduler",
		{ pattern: "*/10 * * * *" },
		{
			name: "auto-renew-subscriptions",
			data: {},
			opts: {
				attempts: 2,
				backoff: { type: "exponential", delay: 30000 },
				removeOnComplete: 20,
				removeOnFail: 50
			}
		}
	);

	console.log("✅ Auto-renew scheduler registered");
}
