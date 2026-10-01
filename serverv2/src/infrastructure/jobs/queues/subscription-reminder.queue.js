import { Queue } from "bullmq";
import { connection } from "../connection.js";

export const subscriptionReminderQueue = new Queue("subscription-reminder", { connection });

export async function registerSubscriptionReminderJob() {
	await subscriptionReminderQueue.upsertJobScheduler(
		"subscription-reminder-scheduler",
		{ pattern: "0 8 * * *" }, // once daily at 08:00
		{
			name: "send-subscription-reminders",
			data: {},
			opts: {
				attempts: 3,
				backoff: { type: "exponential", delay: 30000 },
				removeOnComplete: 20,
				removeOnFail: 50
			}
		}
	);

	console.log("✅ Subscription reminder scheduler registered");
}