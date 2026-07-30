import { Queue } from "bullmq";
import { connection } from "../connection.js";

export const subscriptionExpiryQueue =
	new Queue("subscription-expiry", {
		connection
	});


export async function registerSubscriptionExpiryJob() {

	await subscriptionExpiryQueue.upsertJobScheduler(
		"subscription-expiry-scheduler",
		{
			pattern: "*/5 * * * *" // Every 5 minutes
		},
		{
			name: "expire-subscriptions",
			data: {},
			opts: {
				attempts: 3,
				backoff: {
					type: "exponential",
					delay: 30000
				},
				removeOnComplete: 20,
				removeOnFail: 50
			}
		}
	);


	console.log(
		"✅ Subscription expiry scheduler registered"
	);
}