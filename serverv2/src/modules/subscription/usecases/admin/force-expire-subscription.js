import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class ForceExpireSubscriptionUseCase {

	constructor({
		subscriptionRepository
	}) {
		this.subscriptionRepository =
			subscriptionRepository;
	}

	async execute({
		subscriptionId,

		adminId,
		reason
	}) {

		if (!subscriptionId)
			throw new ValidationError(
				"subscriptionId is required"
			);

		const subscription =
			await this.subscriptionRepository
				.findById(subscriptionId);

		if (!subscription)
			throw new NotFoundError(
				"Subscription not found"
			);

		if (subscription.status === "expired")
			return subscription;

		const updated =
			await this.subscriptionRepository
				.update(subscriptionId, {

					status: "expired",

					endDate: new Date(),

					autoRenew: false,

					events: [
						...(subscription.events || []),

						{
							type: "expired",

							date: new Date(),

							metadata: {
								action:
									"force_expire",

								adminId,

								reason
							}
						}
					]
				});

		return updated;
	}
}