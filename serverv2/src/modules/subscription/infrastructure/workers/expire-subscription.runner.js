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

const expireSubscriptionsUseCase = new ExpireSubscriptionsUseCase({
	subscriptionRepository
});

const workerHandler = new ExpireSubscriptionWorker({
	expireSubscriptions: expireSubscriptionsUseCase
});

// -----------------------------
// BULLMQ WORKER
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
		maxStalledCount: 1
	}
);

// -----------------------------
// EVENTS (IMPORTANT)
// -----------------------------
worker.on("completed", (job) => {
	console.log("✅ Job completed:", job.id);
});

worker.on("failed", (job, err) => {
	console.log("❌ Job failed:", job?.id, err.message);
});

// -----------------------------
console.log("🔥 Worker started (expire-subscriptions)");