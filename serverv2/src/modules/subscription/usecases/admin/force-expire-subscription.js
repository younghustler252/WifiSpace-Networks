import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class ForceExpireSubscriptionUseCase {
	constructor({ 
		subscriptionRepository, 
		subscriptionQueue // 🔥 FIXED: Injected shared Redis queue service instead of direct execution
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.subscriptionQueue = subscriptionQueue;
	}

	async execute({ subscriptionId, adminId, reason, context = {} }) {
		if (!subscriptionId) throw new ValidationError("subscriptionId is required");

		// -----------------------------
		// 1. Fetch subscription
		// -----------------------------
		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) throw new NotFoundError("Subscription not found");

		// Already expired? Nothing to do
		if (subscription.isExpired()) return subscription;

		// -----------------------------
		// 2. Expire subscription
		// -----------------------------
		subscription.expire(); // Uses entity lifecycle method (sets status to "expired")

		// 🔥 RETRY & SYNC FLAGS INITIALIZATION
		// Reset tracking parameters to pending so filters capture this operational transition state
		subscription.mikrotikStatus = "pending";
		subscription.mikrotikError = null;

		// Add metadata about admin action
		subscription.addEvent("expired", { 
			action: "force_expire", 
			adminId, 
			reason: reason || "Admin forced lifecycle expiration" 
		});

		// Persist the updated subscription
		const updatedSubscription = await this.subscriptionRepository.update(subscriptionId, subscription);

		// -----------------------------
		// 3. DISPATCH TO EXPIRE-SUBSCRIPTIONS QUEUE
		// -----------------------------
		try {
			// Reuses the exact same queue that handles natural cron expirations
			await this.subscriptionQueue.add("expire-subscriptions", {
				subscriptionId: subscription.id,
				context: {
					...context,
					actorId: adminId || "SYSTEM_ADMIN_TERMINATOR",
					reason: reason || "Admin forced lifecycle expiration"
				}
			});
		} catch (queueErr) {
			console.error(
				"[ForceExpireSubscriptionUseCase] Failed to dispatch job context to Redis queue:",
				queueErr.message
			);
			// Left safely as 'pending' inside MongoDB. If Redis drops, 
			// fallback cron loops or manual refreshes can process it safely.
		}

		return updatedSubscription;
	}
}
