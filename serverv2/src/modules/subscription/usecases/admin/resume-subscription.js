import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";

export class ResumeSubscriptionUseCase {
    constructor({ subscriptionRepository, resumeNetworkAccount, analyticsTracker }) {
        this.subscriptionRepository = subscriptionRepository;
        this.resumeNetworkAccount = resumeNetworkAccount;
        this.analyticsTracker = analyticsTracker;
    }

    async execute({ subscriptionId, context = {} }) {
        if (!subscriptionId) throw new ValidationError("subscriptionId is required");

        const subscription = await this.subscriptionRepository.findById(subscriptionId);
        if (!subscription) throw new NotFoundError("Subscription not found");

        if (!subscription.isSuspended()) {
            throw new ValidationError("Subscription is not suspended");
        }

        // 1️⃣ Use entity method to resume subscription
        subscription.resume();

        // 2️⃣ Persist subscription changes
        await this.subscriptionRepository.update(subscription.id, subscription);

        // 3️⃣ Resume network account
        try {
            await this.resumeNetworkAccount.execute(subscription.accountId, context);
        } catch (err) {
            console.error(`Failed to resume network account for subscription ${subscription.id}:`, err.message);
        }

        // 4️⃣ Track analytics
        try {
            await this.analyticsTracker.track(
                ANALYTICS_EVENTS.SUBSCRIPTION_RESUMED,
                { subscriptionId }
            );
        } catch (err) {
            console.error("Analytics failed:", err.message);
        }

        return subscription;
    }
}