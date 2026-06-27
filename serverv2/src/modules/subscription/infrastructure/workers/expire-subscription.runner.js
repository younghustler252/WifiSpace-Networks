import { Worker } from "bullmq";
import { redisClient } from "../../../../config/redisClient.js";

// -----------------------------
// MANUAL DEPENDENCIES (NO DI)
// -----------------------------
import { SubscriptionRepositoryMongo } from "../../infrastructure/repositories/subscription.respository.mongo.js";
import { ExpireSubscriptionsUseCase } from "../../usecases/system/expire-subscriptions.js";
import { ExpireSubscriptionWorker } from "./expire-subscription.worker.js";

// -----------------------------
// CREATE DEPENDENCY TREE
// -----------------------------
const subscriptionRepository = new SubscriptionRepositoryMongo();

// Note: Ensure your main entry file passes your analytics tracker 
// and suspendNetworkAccount instances here if needed.
const expireSubscriptionsUseCase = new ExpireSubscriptionsUseCase({
	subscriptionRepository
});

const workerHandler = new ExpireSubscriptionWorker({
	expireSubscriptions: expireSubscriptionsUseCase
});

// -----------------------------
// BULLMQ WORKER WITH BACKOFF RETRIES
// -----------------------------
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
		
		// 🔥 FIXED: Configured BullMQ to automatically manage hardware/network retry waves
		settings: {
			backoff: {
				type: "exponential",
				delay: 5000 // Initial delay window of 5 seconds on first network error drop
			}
		}
	}
);

// -----------------------------
// EVENTS (IMPORTANT)
// -----------------------------
worker.on("completed", (job) => {
	console.log(`✅ Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
	console.log(`❌ Job failed: ${job?.id} | Reason: ${err.message}`);
});

// -----------------------------
console.log("🔥 Worker started (expire-subscriptions)");
