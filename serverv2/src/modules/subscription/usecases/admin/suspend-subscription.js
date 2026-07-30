import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";

export class SuspendSubscriptionUseCase {

	constructor({
		subscriptionRepository,
		networkService,
		analyticsTracker
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
		this.analyticsTracker = analyticsTracker;
	}


	async execute({
		subscriptionId,
		reason,
		adminId,
		context = {}
	}) {

		if (!subscriptionId) {
			throw new ValidationError(
				"subscriptionId is required"
			);
		}

		if (!reason) {
			throw new ValidationError(
				"suspension reason is required"
			);
		}


		const subscription =
			await this.subscriptionRepository.findById(
				subscriptionId
			);


		if (!subscription) {
			throw new NotFoundError(
				"Subscription not found"
			);
		}


		subscription.suspend(reason);

		await this.subscriptionRepository.update(
			subscription.id,
			subscription
		);


		const networkResult =
			await this.networkService.suspend(
				subscription,
				reason
			);


		if (!networkResult.success) {
			console.error(
				`[SuspendSubscriptionUseCase] Network suspension failed for ${subscription.id}:`,
				networkResult.error
			);
		}


		try {

			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.SUBSCRIPTION_SUSPENDED,
				{
					subscriptionId: subscription.id,
					reason,
					adminId
				}
			);

		} catch(error) {

			console.error(
				"Analytics failed:",
				error.message
			);
		}


		return {
			subscription,
			network: networkResult
		};
	}
}