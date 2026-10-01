// infrastructure/jobs/workers/notification-dispatch.worker.js
import { Worker } from "bullmq";
import { connection } from "../connection.js";
import { container } from "../../../container/index.js";
import { attachWorkerLifecycleLogging } from "../worker-events.js";

export function createNotificationDispatchWorker() {
	const worker = new Worker(
		"notification-dispatch",
		async () => {
			const dispatchNotifications = container.resolve("dispatchNotifications");
			const result = await dispatchNotifications.execute();
			console.log(`Notification dispatch: checked ${result.checked}, sent ${result.sent}, failed ${result.failed}`);
		},
		{ connection, concurrency: 1 }
	);
	attachWorkerLifecycleLogging(worker, "notification-dispatch", { notifyOnFailure: false }); // avoid recursive alerting if the alert-sender itself is what's failing
	return worker;
}