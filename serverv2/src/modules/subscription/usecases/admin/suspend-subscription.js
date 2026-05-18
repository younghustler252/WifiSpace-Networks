import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";

export class SuspendSubscriptionUseCase {
    constructor({ subscriptionRepository, suspendNetworkAccountUseCase, analyticsTracker }) {
        this.subscriptionRepository = subscriptionRepository;
        this.suspendNetworkAccountUseCase = suspendNetworkAccountUseCase;
        this.analyticsTracker = analyticsTracker;
    }

    async execute({ subscriptionId, reason, context = {} }) {
        if (!subscriptionId) throw new ValidationError("subscriptionId is required");
        if (!reason) throw new ValidationError("suspension reason is required");

        const subscription = await this.subscriptionRepository.findById(subscriptionId);
        if (!subscription) throw new NotFoundError("Subscription not found");

        // 1️⃣ Update subscription entity
        subscription.suspend(reason);

        // 2️⃣ Persist subscription changes
        await this.subscriptionRepository.update(subscription.id, subscription);

        // 3️⃣ Suspend network account
        try {
            await this.suspendNetworkAccountUseCase.execute(subscription.accountId, reason, context);
        } catch (err) {
            console.error(`Failed to suspend network account for subscription ${subscription.id}:`, err.message);
        }

        // 4️⃣ Track analytics
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