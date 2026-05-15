
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";
export class SuspendSubscriptionUseCase {
	constructor({ subscriptionRepository, analyticsTracker }) {
		this.subscriptionRepository = subscriptionRepository;
		this.analyticsTracker = analyticsTracker;
	}

	async execute({ subscriptionId, reason }) {
		if (!subscriptionId)
			throw new ValidationError("subscriptionId is required");

		if (!reason)
			throw new ValidationError("suspension reason is required");

		const subscription =
			await this.subscriptionRepository.findById(subscriptionId);

		if (!subscription)
			throw new NotFoundError("Subscription not found");

		if (subscription.status === "suspended") return subscription;

		const now = new Date();

		subscription.status = "suspended";
		subscription.suspendedAt = now;
		subscription.suspensionReason = reason;

		subscription.events.push({
			type: "suspended",
			date: now,
			metadata: { reason }
		});

		await this.subscriptionRepository.update(subscription.id, subscription);

		try {
			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.SUBSCRIPTION_SUSPENDED,
				{ subscriptionId, reason }
			);
		} catch (err) {
			console.error("Analytics failed:", err.message);
		}

		return subscription;
	}
}