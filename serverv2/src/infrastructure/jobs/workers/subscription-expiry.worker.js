import { Worker } from "bullmq";
import { connection } from "../connection.js";
import { container } from "../../../container/index.js";


export function createSubscriptionExpiryWorker() {

	return new Worker(
		"subscription-expiry",
		async () => {

			console.log(
				"Checking expired subscriptions..."
			);


			const {
				expireSubscriptions
			} = container.cradle;


			const result =
				await expireSubscriptions.execute();


			console.log(
				`Expired ${result.expiredCount} subscription(s)`
			);
		},
		{
			connection,
			concurrency: 1
		}
	);
}