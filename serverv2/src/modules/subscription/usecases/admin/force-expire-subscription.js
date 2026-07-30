import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";


export class ForceExpireSubscriptionUseCase {

	constructor({
		subscriptionRepository,
		networkService
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
	}


	async execute({
		subscriptionId,
		adminId,
		reason,
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



		// Already expired
		if (subscription.isExpired()) {
			return subscription;
		}



		// -----------------------------
		// Update subscription lifecycle
		// -----------------------------

		subscription.expire();



		// Optional audit/event history
		subscription.addEvent(
			"expired",
			{
				action: "force_expire",
				adminId,
				reason:
					reason ||
					"Admin forced lifecycle expiration"
			}
		);



		await this.subscriptionRepository.update(
			subscription.id,
			subscription
		);



		// -----------------------------
		// Remove network access
		// -----------------------------

		const networkResult =
			await this.networkService.suspend(
				subscription,
				reason ||
				"Subscription expired",
				context
			);



		return {
			subscription,
			networkResult
		};
	}
}