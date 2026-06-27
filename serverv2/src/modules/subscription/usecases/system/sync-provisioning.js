import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

export class SyncProvisioningUseCase {
	constructor({ subscriptionRepository, provisionNetworkAccount }) {
		this.subscriptionRepository = subscriptionRepository;
		this.provisionNetworkAccount = provisionNetworkAccount;
	}

	async execute({ subscriptionId, context = {} }) {
		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) throw new NotFoundError("Subscription entity not found");

		// Idempotency guard check
		if (subscription.mikrotikStatus === "synced") return subscription;

		try {
			// Trigger physical router command sequence execution
			await this.provisionNetworkAccount.execute(subscriptionId, context);

			// If success, clear out any failure trackers
			subscription.mikrotikStatus = "synced";
			subscription.mikrotikError = null;
			subscription.mikrotikLastSyncAt = new Date();
			await this.subscriptionRepository.save(subscription);

		} catch (error) {
			// Update status so admin table filters pick up the warning flags
			subscription.mikrotikStatus = "failed";
			subscription.mikrotikError = error.message;
			subscription.mikrotikLastSyncAt = new Date();
			await this.subscriptionRepository.save(subscription);

			// 🔥 Throw error so BullMQ handles backoff delay schedules natively
			throw error;
		}

		return subscription;
	}
}
