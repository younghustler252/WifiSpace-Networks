// infrastructure/jobs/queues/notification-dispatch.queue.js
import { Queue } from "bullmq";
import { connection } from "../connection.js";

export const notificationDispatchQueue = new Queue("notification-dispatch", { connection });

export async function registerNotificationDispatchJob() {
	await notificationDispatchQueue.upsertJobScheduler(
		"notification-dispatch-scheduler",
		{ pattern: "*/1 * * * *" }, // every minute
		{ name: "dispatch-notifications", data: {}, opts: { attempts: 3, backoff: { type: "exponential", delay: 30000 }, removeOnComplete: 20, removeOnFail: 50 } }
	);
	console.log("✅ Notification dispatch scheduler registered");
}