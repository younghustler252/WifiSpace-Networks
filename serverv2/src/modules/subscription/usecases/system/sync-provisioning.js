import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

export class SyncProvisioningUseCase {
	constructor({ subscriptionRepository, provisionNetworkAccount }) {
		this.subscriptionRepository = subscriptionRepository;
		this.provisionNetworkAccount = provisionNetworkAccount;
	}

	async execute({ subscriptionId, context = {} }) {
		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) throw new NotFoundError("Subscription entity not found");

		if (subscription.mikrotikStatus === "synced") return subscription;

		try {
			await this.provisionNetworkAccount.execute(subscriptionId, context);

			subscription.mikrotikStatus = "synced";
			subscription.mikrotikError = null;
			subscription.mikrotikLastSyncAt = new Date();
			
			return await this.subscriptionRepository.save(subscription);

		} catch (error) {
			subscription.mikrotikStatus = "failed";
			subscription.mikrotikError = error.message;
			subscription.mikrotikLastSyncAt = new Date();
			
			try {
				await this.subscriptionRepository.save(subscription);
			} catch (dbError) {
				console.error("Failed to persist failed sync state to database:", dbError.message);
			}

			throw error;
		}
	}
}
