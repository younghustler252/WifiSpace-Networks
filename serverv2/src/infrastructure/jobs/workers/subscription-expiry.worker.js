import { Worker } from "bullmq";
import { connection } from "../connection.js";
import { container } from "../../../container/index.js";
import { attachWorkerLifecycleLogging } from "../worker-events.js";


export function createSubscriptionExpiryWorker() {

	const worker = new Worker(
		"subscription-expiry",
		async () => {

			console.log(
				"Checking expired subscriptions..."
			);


			const expireSubscriptions =
				container.resolve("expireSubscriptions");


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


	attachWorkerLifecycleLogging(
		worker,
		"subscription-expiry",
		{ notifyOnFailure: true }
	);


	return worker;
}
