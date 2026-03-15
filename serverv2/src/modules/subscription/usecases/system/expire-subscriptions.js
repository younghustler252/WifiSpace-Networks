import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class ExpireSubscriptionsUseCase {

	constructor({
		accountSubscriptionRepository
	}) {
		this.accountSubscriptionRepository =
			accountSubscriptionRepository;
	}

	async execute() {

		const now = new Date();

		const expiredSubscriptions =
			await this.accountSubscriptionRepository
				.findExpired(now);

		const results = [];

		for (const subscription of expiredSubscriptions) {

			const updated =
				await this.accountSubscriptionRepository
					.updateStatus(subscription.id, "expired");

			results.push(updated);
		}

		return {
			expiredCount: results.length,
			subscriptions: results
		};
	}

}