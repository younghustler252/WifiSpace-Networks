import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";

export class ResumeSubscriptionUseCase {
    constructor({ 
        subscriptionRepository, 
        subscriptionQueue, // 🔥 FIXED: Injected shared Redis queue service
        analyticsTracker 
    }) {
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionQueue = subscriptionQueue;
        this.analyticsTracker = analyticsTracker;
    }

    async execute({ subscriptionId, adminId, context = {} }) {
        if (!subscriptionId) throw new ValidationError("subscriptionId is required");

        const subscription = await this.subscriptionRepository.findById(subscriptionId);
        if (!subscription) throw new NotFoundError("Subscription not found");

        if (!subscription.isSuspended()) {
            throw new ValidationError("Subscription is not suspended");
        }

        // 1️⃣ Use entity lifecycle method to resume billing state mechanics
        subscription.resume();

        // 🔥 RETRY & SYNC FLAGS INITIALIZATION
        // Set tracking parameters to pending so frontend table filters capture this transition state
        subscription.mikrotikStatus = "pending";
        subscription.mikrotikError = null;

        // 2️⃣ Persist subscription changes
        await this.subscriptionRepository.update(subscription.id, subscription);

        // 3️⃣ DISPATCH RE-PROVISIONING TASK TO BULLMQ REDIS QUEUE
        try {
            await this.subscriptionQueue.add("provision-network", {
                subscriptionId: subscription.id,
                context: {
                    ...context,
                    actorId: adminId || "SYSTEM_ADMIN_RESUMER"
                }
            });
        } catch (queueErr) {
            console.error(
                `[ResumeSubscriptionUseCase] Failed to dispatch job context to Redis queue for sub ${subscription.id}:`,
                queueErr.message
            );
            // Left safely as 'pending' inside MongoDB. If Redis drops, 
            // fallback cron system loops can process it seamlessly.
        }

        // 4️⃣ Track analytics (non-blocking)
        try {
            await this.analyticsTracker.track(
                ANALYTICS_EVENTS.SUBSCRIPTION_RESUMED,
                { subscriptionId: subscription.id }
            );
        } catch (err) {
            console.error("Analytics failed:", err.message);
        }

        return subscription;
    }
}
