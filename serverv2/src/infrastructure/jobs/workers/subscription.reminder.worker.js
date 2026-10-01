import { Worker } from "bullmq";
import { connection } from "../connection.js";
import { container } from "../../../container/index.js";
import { attachWorkerLifecycleLogging } from "../worker-events.js";


export function createSubscriptionReminderWorker() {

	const worker = new Worker(
		"subscription-reminder",
		async () => {

			const sendSubscriptionReminder =
				container.resolve("sendSubscriptionReminder");


			await sendSubscriptionReminder.execute();

		},
		{
			connection,
			concurrency: 1
		}
	);


	attachWorkerLifecycleLogging(
		worker,
		"subscription-reminder"
	);


	return worker;
}
