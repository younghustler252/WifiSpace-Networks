import { Worker } from "bullmq";
import { redisClient } from "../../../../config/redisClient.js";
import { container } from "../../../../container/index.js";
import { ExpireSubscriptionWorker } from "./expire-subscription.worker.js";

const { expireSubscriptions } = container.cradle;

const workerHandler = new ExpireSubscriptionWorker({
	expireSubscriptions: expireSubscriptions
});

const worker = new Worker(
	"expire-subscriptions",
	async (job) => {
		return workerHandler.handle(job);
	},
	{
		connection: redisClient,
		concurrency: 10,
		lockDuration: 30000,
		stalledInterval: 30000,
		maxStalledCount: 1,
		settings: {
			backoff: {
				type: "exponential",
				delay: 5000 
			}
		}
	}
);

worker.on("completed", (job) => {
	console.log(`✅ Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
	console.log(`❌ Job failed: ${job?.id} | Reason: ${err.message}`);
});

console.log("🔥 Worker started (expire-subscriptions)");
