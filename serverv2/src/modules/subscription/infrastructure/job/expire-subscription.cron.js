import cron from "node-cron";
import { expireSubscriptionQueue } from "../queue/expire-subscription.queue.js";
import { SubscriptionRepositoryMongo } from "../../infrastructure/repositories/subscription.respository.mongo.js";

cron.schedule("*/5 * * * *", async () => {
	console.log("Running expire subscription cron job...");

	const now = new Date();
	const subscriptionRepository = new SubscriptionRepositoryMongo();

	const subscriptions = await subscriptionRepository.findExpired(now);

	if (!subscriptions.length) {
		console.log("No subscriptions to expire.");
		return;
	}

	for (const subscription of subscriptions) {
		await expireSubscriptionQueue.add(
			"expire-subscriptions",
			{
				subscriptionId: subscription.id
			},
			{
				jobId: subscription.id, // 🔥 THIS IS THE FIX
				removeOnComplete: true,
				removeOnFail: 100
			}
		);
	}

	console.log(`${subscriptions.length} subscription(s) queued.`);
});