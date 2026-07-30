import { Subscription } from "../../domain/subscription.entity.js";

export class ExpireSubscriptionsUseCase {

	constructor({
		subscriptionRepository,
		networkService
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
	}


	async execute() {

		const subscriptions =
			await this.subscriptionRepository.findExpired(
				new Date()
			);


		let expiredCount = 0;


		for (const subscription of subscriptions) {

			if (subscription.isAlreadyFinalized()) {
				continue;
			}


			subscription.expire();


			await this.subscriptionRepository.update(
				subscription.id,
				subscription
			);


			await this.networkService.suspend(
				subscription,
				"Subscription expired"
			);


			expiredCount++;
		}


		return {
			expiredCount
		};
	}
}