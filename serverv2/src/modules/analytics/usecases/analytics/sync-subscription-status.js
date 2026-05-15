export default class SyncSubscriptionStats {
	constructor(subscriptionRepo, analyticsRepo) {
		this.subscriptionRepo = subscriptionRepo;
		this.analyticsRepo = analyticsRepo;
	}

	async execute() {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const active = await this.subscriptionRepo.countActive();
		const expired = await this.subscriptionRepo.countExpired();

		await this.analyticsRepo.upsertDaily(today, {
			activeSubscriptions: active,
			expiredSubscriptions: expired
		});
	}
}