import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class SyncSubscriptionHardwareUseCase {
	constructor({
		subscriptionRepository,
		subscriptionQueue
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.subscriptionQueue = subscriptionQueue;
	}

	async execute({ subscriptionId, adminId, context = {} }) {
		if (!subscriptionId) {
			throw new ValidationError("subscriptionId is required");
		}

		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) {
			throw new NotFoundError("Subscription not found");
		}

		subscription.mikrotikStatus = "pending";
		subscription.mikrotikError = null;
		await this.subscriptionRepository.update(subscription.id, subscription);

		const targetQueue = ["active", "pending"].includes(subscription.status)
			? "provision-subscription"
			: "expire-subscriptions";

		const jobName = targetQueue === "provision-subscription" 
			? "provision-network" 
			: "expire-subscriptions";

		try {
			await this.subscriptionQueue.add(jobName, {
				subscriptionId: subscription.id,
				context: {
					...context,
					actorId: adminId || "SYSTEM_ADMIN_RESYNC",
					source: "admin_resync"
				}
			});
		} catch (queueErr) {
			console.error("[SyncSubscriptionHardwareUseCase] Redis queue dispatch failed:", queueErr.message);
			throw new Error("Failed to dispatch re-sync job to message broker.");
		}

		return subscription;
	}
}
