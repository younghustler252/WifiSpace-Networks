import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { ANALYTICS_EVENTS } from "../../../analytics/domain/analytics.events.js";

export class ResumeSubscriptionUseCase {

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
		adminId,
		context = {}
	}) {

		if (!subscriptionId) {
			throw new ValidationError(
				"subscriptionId is required"
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


		if (!subscription.isSuspended()) {
			throw new ValidationError(
				"Subscription is not suspended"
			);
		}


		subscription.resume();


		await this.subscriptionRepository.update(
			subscription.id,
			subscription
		);


		const networkResult =
			await this.networkService.resume(
				subscription
			);


		if (!networkResult.success) {
			console.error(
				`[ResumeSubscriptionUseCase] Network resume failed for ${subscription.id}:`,
				networkResult.error
			);
		}


		try {

			await this.analyticsTracker.track(
				ANALYTICS_EVENTS.SUBSCRIPTION_RESUMED,
				{
					subscriptionId: subscription.id,
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