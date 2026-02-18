const subscriptionExpiryQueue = require("../queues/subscriptionExpiryQueue");

(async () => {
	await subscriptionExpiryQueue.add(
		"daily-expiry-check",
		{}, // no payload needed
		{
			repeat: {
				pattern: "0 2 * * *", // every day at 2AM
				tz: "Africa/Lagos"
			}
		}
	);

	console.log("Subscription expiry repeatable job scheduled ✅");
})();
