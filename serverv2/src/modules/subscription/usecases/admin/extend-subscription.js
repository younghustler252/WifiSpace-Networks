import { NotFoundError } from "../../../../shared/errors/not-found-error.js";
import { ValidationError } from "../../../../shared/errors/validation-error.js";


export class ExtendSubscriptionUseCase {

	constructor({
		subscriptionRepository,
		networkService
	}) {
		this.subscriptionRepository = subscriptionRepository;
		this.networkService = networkService;
	}


	async execute({
		subscriptionId,
		days,
		adminId,
		reason = "Admin manual extension",
		context = {}
	}) {

		// -----------------------------
		// VALIDATION
		// -----------------------------

		if (!subscriptionId) {
			throw new ValidationError(
				"subscriptionId is required"
			);
		}


		if (!days || isNaN(Number(days)) || Number(days) <= 0) {
			throw new ValidationError(
				"days must be greater than 0"
			);
		}



		// -----------------------------
		// LOAD SUBSCRIPTION
		// -----------------------------

		const subscription =
			await this.subscriptionRepository.findById(
				subscriptionId
			);


		if (!subscription) {
			throw new NotFoundError(
				"Subscription not found"
			);
		}



		const wasExpired =
			subscription.status === "expired";



		// -----------------------------
		// EXTEND EXPIRY DATE
		// -----------------------------

		const now = new Date();

		const currentExpiry =
			subscription.expiresAt
				? new Date(subscription.expiresAt)
				: now;


		const baseDate =
			currentExpiry < now
				? now
				: currentExpiry;


		baseDate.setDate(
			baseDate.getDate() + Number(days)
		);


		subscription.expiresAt = baseDate;


		subscription.manualAdjustmentDays =
			(subscription.manualAdjustmentDays || 0)
			+ Number(days);



		// -----------------------------
		// RESTORE STATE IF EXPIRED
		// -----------------------------

		if (wasExpired) {
			subscription.status = "active";
			subscription.expiredAt = null;
		}



		// -----------------------------
		// AUDIT EVENT
		// -----------------------------

		subscription.addEvent(
			"manual_adjustment",
			{
				action: "extend",
				days: Number(days),
				adminId,
				reason
			}
		);



		await this.subscriptionRepository.update(
			subscription.id,
			subscription
		);



		// -----------------------------
		// RESTORE NETWORK IF NEEDED
		// -----------------------------

		let networkResult = null;


		if (wasExpired) {

			networkResult =
				await this.networkService.resume(
					subscription,
					{
						...context,
						actorId:
							adminId ||
							"SYSTEM_ADMIN_EXTENDER"
					}
				);
		}



		return {
			subscription,
			networkResult
		};
	}
}