import { registerRouterSyncJob } from "./queues/router-sync.queue.js";
import { registerPaymentExpiryJob } from "./queues/payment-expiry.queue.js";
import { registerPaymentCleanupJob } from "./queues/payment-cleanup.queue.js";
import { registerSubscriptionExpiryJob } from "./queues/subscription-expiry.queue.js";
import { registerSubscriptionReminderJob } from "./queues/subscription-reminder.queue.js";
import { registerUsageSyncJob } from "./queues/usage-sync.queue.js";
import { registerNotificationDispatchJob } from "./queues/notification-dispatch.queues.js";

import { createRouterSyncWorker } from "./workers/router-sync.worker.js";
import { createPaymentExpiryWorker } from "./workers/payment-expiry.worker.js";
import { createPaymentCleanupWorker } from "./workers/payment-cleanup.worker.js";
import { createSubscriptionExpiryWorker } from "./workers/subscription-expiry.worker.js";
import { createSubscriptionReminderWorker } from "./workers/subscription-reminder.worker.js";
import { createUsageSyncWorker } from "./workers/usage-sync.worker.js";
import { createNotificationDispatchWorker } from "./workers/notification-dispatch.worker.js";

export async function startJobs() {
	await registerRouterSyncJob();
	await registerPaymentExpiryJob();
	await registerPaymentCleanupJob();
	await registerSubscriptionExpiryJob();
	await registerSubscriptionReminderJob();
	await registerUsageSyncJob();
	await registerNotificationDispatchJob();
	
	createRouterSyncWorker();
	createPaymentExpiryWorker();
	createPaymentCleanupWorker();
	createSubscriptionExpiryWorker();
	createSubscriptionReminderWorker();
	createUsageSyncWorker();
	createNotificationDispatchWorker();

	console.log("✅ Background jobs started");
}