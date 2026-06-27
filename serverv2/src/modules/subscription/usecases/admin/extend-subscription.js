import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class ExtendSubscriptionUseCase {
	constructor({
		subscriptionRepository,
		subscriptionQueue // 🔥 INJECTED: Shared BullMQ Redis queue service
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.subscriptionQueue = subscriptionQueue;
	}

	async execute({
		subscriptionId,
		days,
		adminId,
		reason = "Admin manual extension",
		context = {} // Added support for downstream tracking context
	}) {
		// -----------------------------
		// VALIDATION
		// -----------------------------
		if (!subscriptionId) {
			throw new ValidationError("subscriptionId is required");
		}

		if (!days || isNaN(Number(days)) || Number(days) <= 0) {
			throw new ValidationError("days must be greater than 0");
		}

		// -----------------------------
		// RESOLVE DOMAIN ENTITY FROM REPO
		// -----------------------------
		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) {
			throw new NotFoundError("Subscription not found");
		}

		// -----------------------------
		// EXTENSION TIMELINE MATH
		// -----------------------------
		const baseDate = subscription.expiresAt ? new Date(subscription.expiresAt) : new Date();
		const finalBaseDate = baseDate < new Date() ? new Date() : baseDate;

		finalBaseDate.setDate(finalBaseDate.getDate() + Number(days));

		// Apply property mutations to the domain instance fields safely
		subscription.expiresAt = finalBaseDate;
		subscription.manualAdjustmentDays = (subscription.manualAdjustmentDays || 0) + Number(days);

		// -----------------------------
		// STATE INTEGRITY GUARD
		// -----------------------------
		if (subscription.status === "expired") {
			subscription.status = "active";
			subscription.expiredAt = null; 
		}

		// -----------------------------
		// 🔥 INITIALIZE RETRY & SYNC FLAGS
		// -----------------------------
		// Reset tracking parameters to pending so filters capture this update loop
		subscription.mikrotikStatus = "pending";
		subscription.mikrotikError = null;

		// -----------------------------
		// AUDIT LOGGING VIA ENTITY METHOD
		// -----------------------------
		subscription.addEvent("manual_adjustment", {
			action: "extend",
			days: Number(days),
			adminId,
			reason
		});

		// -----------------------------
		// PERSIST COMPATIBLE WHOLE DOMAIN ENTITY
		// -----------------------------
		const updatedEntity = await this.subscriptionRepository.update(
			subscriptionId,
			subscription
		);

		// -----------------------------------------------------------
		// 🔥 DISPATCH HARDWARE REPROVISIONING WORK TO BULLMQ QUEUE
		// -----------------------------------------------------------
		try {
			await this.subscriptionQueue.add("provision-network", {
				subscriptionId: subscription.id,
				context: {
					...context,
					actorId: adminId || "SYSTEM_ADMIN_EXTENDER"
				}
			});
		} catch (queueErr) {
			console.error(
				"[ExtendSubscriptionUseCase] Failed to dispatch job context to Redis queue:",
				queueErr.message
			);
			// Left safely as 'pending' inside MongoDB. If Redis drops, 
			// fallback system sweeps or crons can handle it seamlessly.
		}

		return updatedEntity;
	}
}
