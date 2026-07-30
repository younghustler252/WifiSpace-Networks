import { Worker } from "bullmq";
import { connection } from "../connection.js";
import { container } from "../../../container/index.js";


export function createSubscriptionReminderWorker() {

	return new Worker(
		"subscription-reminder",
		async () => {

			const {
				sendSubscriptionReminder
			} = container.cradle;


			await sendSubscriptionReminder.execute();

		},
		{
			connection,
			concurrency: 1
		}
	);
}