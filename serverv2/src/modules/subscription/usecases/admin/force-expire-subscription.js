import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class ForceExpireSubscriptionUseCase {
	constructor({ subscriptionRepository, suspendNetworkAccount }) {
		this.subscriptionRepository = subscriptionRepository;
		this.suspendNetworkAccount = suspendNetworkAccount;
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
		subscription.expire(); // Uses entity lifecycle method

		// Add metadata about admin action
		subscription.addEvent("expired", { action: "force_expire", adminId, reason });

		// Persist the updated subscription
		const updatedSubscription = await this.subscriptionRepository.update(subscriptionId, subscription);

		// -----------------------------
		// 3. Suspend network account
		// -----------------------------
		if (this.suspendNetworkAccount) {
			try {
				await this.suspendNetworkAccount.execute(subscription.accountId, reason, context);
			} catch (err) {
				console.error("Network suspension failed:", err.message);
				// We don't fail the force-expire just because network suspend failed
			}
		}

		return updatedSubscription;
	}
}