import cron from "node-cron";
import { expireSubscriptionQueue } from "../queue/expire-subscription.queue.js";
import { SubscriptionRepositoryMongo } from "../../infrastructure/repositories/subscription.respository.mongo.js";  // Correct import

// Cron job to check for subscriptions to expire
cron.schedule("*/5 * * * *", async () => {  // every 5 minutes
	console.log("Running expire subscription cron job...");
	const now = new Date();

	// Use the Mongo-specific repository to fetch expired subscriptions
	const subscriptionRepository = new SubscriptionRepositoryMongo();  // Instantiate the Mongo repository

	// Fetch active subscriptions that have passed their expiration date
	const subscriptions = await subscriptionRepository.findExpired(now);  // Using the Mongo repository's `findExpired` method

	if (subscriptions.length === 0) {
		console.log("No subscriptions to expire.");
		return;
	}

	for (const subscription of subscriptions) {
		// Add the subscription to the queue for processing
		await expireSubscriptionQueue.add("expire-subscription", {
		subscriptionId: subscription.id
		});
	}

	console.log(`${subscriptions.length} subscription(s) added to expire queue.`);
});