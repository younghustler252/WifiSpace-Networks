import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";
import { Subscription } from "../../domain/subscription.entity.js";

export class ExpireSubscriptionUseCase {
    constructor({ subscriptionRepository, analyticsTracker, suspendNetworkAccountUseCase }) {
        this.subscriptionRepository = subscriptionRepository;
        this.analyticsTracker = analyticsTracker;
        this.suspendNetworkAccountUseCase = suspendNetworkAccountUseCase; // Injected dependency
    }

    async execute({ subscriptionId, context = {} }) {
        if (!subscriptionId) throw new ValidationError("subscriptionId is required");

        // Fetch subscription
        const rawSub = await this.subscriptionRepository.findById(subscriptionId);
        if (!rawSub) throw new NotFoundError("Subscription not found");

        const subscription = new Subscription(rawSub);

        // Already expired safety check
        if (subscription.isExpired()) return subscription;

        // Expire subscription
        subscription.expire();

        // Persist changes
        await this.subscriptionRepository.update(subscription.id, subscription);

        // Suspend network account if needed
        if (subscription.accountId) {
            try {
                await this.suspendNetworkAccountUseCase.execute(
                    subscription.accountId,
                    "Subscription Expired",
                    context
                );
            } catch (err) {
                console.error(`[ExpireSubscriptionUseCase] Failed to suspend network account:`, err.message);
            }
        }

        // Analytics tracking
        try {
            await this.analyticsTracker.track(
                ANALYTICS_EVENTS.SUBSCRIPTION_EXPIRED,
                {
                    accountId: subscription.accountId,
                    subscriptionId: subscription.id,
                }
            );
        } catch (err) {
            console.error("Analytics failed:", err.message);
        }

        return subscription;
    }
}