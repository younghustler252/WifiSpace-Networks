import cron from "node-cron";

import { subscriptionRepository } from "../../modules/subscription/container/subscription.container.js";
import { addSuspendJob } from "../../modules/mikrotik/queues/mikrotik.suspend.queue.js";

cron.schedule("*/5 * * * *", async () => {

	const expiredSubscriptions =
		await subscriptionRepository.findExpiredActiveSubscriptions();

	for (const sub of expiredSubscriptions) {

		await addSuspendJob(sub.accountId);

		await subscriptionRepository.markExpired(sub.id);
	}

	console.log("Subscription expiry check completed");

});