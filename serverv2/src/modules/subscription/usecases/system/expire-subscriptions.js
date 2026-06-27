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

		// Apply domain rule (sets status to "expired")
		subscription.expire();

		// -----------------------------------------------------------
		// 🔥 MIKROTIK INFRASTRUCTURE LAYER RETRY & SYNC GUARD
		// -----------------------------------------------------------
		if (subscription.accountId) {
			try {
				// We AWAIT this call so network timeout exceptions can bubble up to BullMQ
				await this.suspendNetworkAccount.execute(
					subscription.accountId,
					"Subscription Expired",
					context
				);

				// Sync succeeded -> flag states cleanly
				subscription.mikrotikStatus = "synced";
				subscription.mikrotikError = null;
				subscription.mikrotikLastSyncAt = new Date();

			} catch (routerError) {
				// Sync failed -> capture the exact hardware error on the model for the Admin UI
				subscription.mikrotikStatus = "failed";
				subscription.mikrotikError = routerError.message;
				subscription.mikrotikLastSyncAt = new Date();

				// Save the failure flags immediately before crashing the queue thread execution
				await this.subscriptionRepository.save(subscription);

				// 🔥 CRITICAL: Throw the error so BullMQ transitions to 'failed' and schedules backoff retries
				throw routerError;
			}
		}

		// Persist successful state change
		await this.subscriptionRepository.save(subscription);

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
