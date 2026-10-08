
export class ExpireSubscriptions {
	constructor({ subscriptionRepository, networkService, auditService }) {
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
		this.auditService = auditService;
	}

	async execute() {
		const dueSubscriptions = await this.subscriptionRepository.findDueForExpiry();

		let expiredCount = 0;

		for (const subscription of dueSubscriptions) {
			try {
				subscription.expire();
				await this.subscriptionRepository.update(subscription.id, subscription);

				await this.networkService.suspend(subscription).catch((err) =>
					console.error(`[ExpireSubscriptions] Network suspend failed for ${subscription.id}:`, err.message)
				);

				if (this.auditService) {
					await this.auditService.log({
						actorId: null, actorType: "system", action: "SUBSCRIPTION_EXPIRED",
						entity: "Subscription", entityId: subscription.id
					});
				}

				expiredCount++;
			} catch (err) {
				console.error(`[ExpireSubscriptions] Failed to expire subscription ${subscription.id}:`, err.message);
			}
		}

		return { checked: dueSubscriptions.length, expiredCount };
	}
}