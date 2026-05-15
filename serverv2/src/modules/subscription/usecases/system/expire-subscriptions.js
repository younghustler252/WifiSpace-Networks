import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";

export class ExpireSubscriptionUseCase {
	constructor({
		subscriptionRepository,
		analyticsTracker
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.analyticsTracker = analyticsTracker;
	}

	async execute({ subscriptionId }) {
		if (!subscriptionId)
			throw new ValidationError("subscriptionId is required");

		const subscription =
			await this.subscriptionRepository.findById(
				subscriptionId
			);

		if (!subscription)
			throw new NotFoundError("Subscription not found");

		// -----------------------------
		// ❗ already expired safety check
		// -----------------------------
		if (subscription.status === "expired") {
			return subscription;
		}

		const now = new Date();

		// -----------------------------
		// 🔥 expire subscription
		// -----------------------------
		subscription.status = "expired";
		subscription.expiredAt = now;

		// -----------------------------
		// 🔥 audit event
		// -----------------------------
		subscription.events.push({
			type: "expired",
			date: now,
			metadata: {
				endDate: subscription.endDate
			}
		});

		// -----------------------------
		// 🔥 persist
		// -----------------------------
		await this.subscriptionRepository.update(
			subscription.id,
			subscription
		);

		// -----------------------------
		// ✅ analytics
		// -----------------------------
		try {
			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.SUBSCRIPTION_EXPIRED,
				{
					accountId: subscription.accountId,
					subscriptionId: subscription.id
				}
			);
		} catch (err) {
			console.error("Analytics failed:", err.message);
		}

		return subscription;
	}
}