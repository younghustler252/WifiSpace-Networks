import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class ExtendSubscriptionUseCase {

	constructor({
		subscriptionRepository
	}) {
		this.subscriptionRepository =
			subscriptionRepository;
	}

	async execute({
		subscriptionId,

		days,

		adminId,
		reason
	}) {

		if (!subscriptionId)
			throw new ValidationError(
				"subscriptionId is required"
			);

		if (!days || days <= 0)
			throw new ValidationError(
				"days must be greater than 0"
			);

		const subscription =
			await this.subscriptionRepository
				.findById(subscriptionId);

		if (!subscription)
			throw new NotFoundError(
				"Subscription not found"
			);

		// extend expiry
		const updatedEndDate =
			new Date(subscription.endDate);

		updatedEndDate.setDate(
			updatedEndDate.getDate() + days
		);

		// update adjustments
		const currentAdjustments =
			subscription.manualAdjustmentDays || 0;

		const updated =
			await this.subscriptionRepository
				.update(subscriptionId, {
					endDate: updatedEndDate,

					manualAdjustmentDays:
						currentAdjustments + days,

					$push: {
						events: {
							type:
								"manual_adjustment",

							date: new Date(),

							metadata: {
								action:
									"extend",

								days,

								adminId,

								reason
							}
						}
					}
				});

		return updated;
	}
}