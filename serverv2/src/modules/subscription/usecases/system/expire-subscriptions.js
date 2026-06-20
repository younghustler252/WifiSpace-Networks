import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";
import { Subscription } from "../../domain/subscription.entity.js";

export class ExpireSubscriptionsUseCase {
	constructor({
		subscriptionRepository,
		analyticsTracker,
		suspendNetworkAccount
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.analyticsTracker = analyticsTracker;
		this.suspendNetworkAccount = suspendNetworkAccount;
	}

	async execute({ subscriptionId, context = {} }) {
		if (!subscriptionId) {
			throw new ValidationError("subscriptionId is required");
		}

		const rawSub = await this.subscriptionRepository.findById(subscriptionId);

		if (!rawSub) {
			throw new NotFoundError("Subscription not found");
		}

		const subscription = new Subscription(rawSub);

		// Already processed (idempotency guard)
		if (subscription.isAlreadyFinalized()) {
			return subscription;
		}

		// Not yet due for expiry → skip safely
		if (!subscription.isPastExpiry()) {
			return subscription;
		}

		// Apply domain rule
		subscription.expire();

		// Persist state change
		await this.subscriptionRepository.save(subscription);

		// Side-effect: network suspension (async-safe, retryable)
		if (subscription.accountId) {
			this.suspendNetworkAccount.execute(
				subscription.accountId,
				"Subscription Expired",
				context
			).catch((err) => {
				console.error(
					"[ExpireSubscriptionsUseCase] Network suspend failed:",
					err.message
				);
			});
		}

		// Analytics (non-blocking)
		this.analyticsTracker.track(
			ANALYTICS_EVENTS.SUBSCRIPTION_EXPIRED,
			{
				accountId: subscription.accountId,
				subscriptionId: subscription.id
			}
		).catch((err) => {
			console.error("Analytics failed:", err.message);
		});

		return subscription;
	}
}