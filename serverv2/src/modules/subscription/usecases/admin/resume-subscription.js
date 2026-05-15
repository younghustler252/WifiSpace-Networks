import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";

export class ResumeSubscriptionUseCase {
	constructor({ subscriptionRepository, analyticsTracker }) {
		this.subscriptionRepository = subscriptionRepository;
		this.analyticsTracker = analyticsTracker;
	}

	async execute({ subscriptionId }) {
		if (!subscriptionId)
			throw new ValidationError("subscriptionId is required");

		const subscription =
			await this.subscriptionRepository.findById(subscriptionId);

		if (!subscription)
			throw new NotFoundError("Subscription not found");

		if (!subscription.suspendedAt)
			throw new ValidationError("Invalid suspension state");

		const now = new Date();

		const suspendedDuration =
			now - new Date(subscription.suspendedAt);

		subscription.endDate = new Date(
			new Date(subscription.endDate).getTime() + suspendedDuration
		);

		subscription.totalSuspendedDuration += suspendedDuration;

		subscription.suspendedAt = null;
		subscription.suspensionReason = null;
		subscription.status = "active";

		subscription.events.push({
			type: "resumed",
			date: now,
			metadata: { suspendedDuration }
		});

		await this.subscriptionRepository.update(subscription.id, subscription);

		try {
			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.SUBSCRIPTION_RESUMED,
				{
					subscriptionId,
					suspendedDuration
				}
			);
		} catch (err) {
			console.error("Analytics failed:", err.message);
		}

		return subscription;
	}
}