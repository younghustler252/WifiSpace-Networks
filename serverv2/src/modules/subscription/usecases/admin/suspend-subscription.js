import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";

export class SuspendSubscriptionUseCase {
    constructor({ 
        subscriptionRepository, 
        subscriptionQueue, // 🔥 FIXED: Injected shared Redis queue service
        analyticsTracker 
    }) {
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionQueue = subscriptionQueue;
        this.analyticsTracker = analyticsTracker;
    }

    async execute({ subscriptionId, reason, adminId, context = {} }) {
        if (!subscriptionId) throw new ValidationError("subscriptionId is required");
        if (!reason) throw new ValidationError("suspension reason is required");

        const subscription = await this.subscriptionRepository.findById(subscriptionId);
        if (!subscription) throw new NotFoundError("Subscription not found");

        // 1️⃣ Update subscription entity billing state mechanics
        subscription.suspend(reason);

        // 🔥 RETRY & SYNC FLAGS INITIALIZATION
        // Set tracking parameters to pending so frontend table filters capture this transition state
        subscription.mikrotikStatus = "pending";
        subscription.mikrotikError = null;

        // 2️⃣ Persist subscription changes
        await this.subscriptionRepository.update(subscription.id, subscription);

        // 3️⃣ DISPATCH TEARDOWN TASK TO BULLMQ REDIS QUEUE
        try {
            // Reuses the exact same queue channel that handles expirations and teardowns
			await this.subscriptionQueue.add("expire-subscriptions", {
				subscriptionId: subscription.id,
				context: {
					...context,
					actorId: adminId || "SYSTEM_ADMIN_SUSPENDER",
					reason: reason || "Administrative suspension override"
				}
			});
        } catch (queueErr) {
            console.error(
                `[SuspendSubscriptionUseCase] Failed to dispatch job context to Redis queue for sub ${subscription.id}:`,
                queueErr.message
            );
            // Left safely as 'pending' inside MongoDB. If Redis drops, 
            // fallback system sweeps or crons can handle it seamlessly.
        }

        // 4️⃣ Track analytics (non-blocking)
        try {
            await this.analyticsTracker.track(
                ANALYTICS_EVENTS.SUBSCRIPTION_SUSPENDED,
                { subscriptionId: subscription.id, reason }
            );
        } catch (err) {
            console.error("Analytics failed:", err.message);
        }

        return subscription;
    }
}
