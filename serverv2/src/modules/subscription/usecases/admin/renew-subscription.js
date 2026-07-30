import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";


export class AdminRenewSubscriptionUseCase {

	constructor({
		adminRecordPayment,
		renewSubscription,
		subscriptionRepository,
		planRepository,
		networkService
	}) {
		this.adminRecordPaymentUseCase = adminRecordPayment;
		this.renewSubscriptionUseCase = renewSubscription;
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
		this.networkService = networkService;
	}


	async execute({
		subscriptionId,
		cycles = 1,
		reason = "Admin manual renewal",
		reference,
		context = {}
	}) {

		// --------------------------------
		// VALIDATION
		// --------------------------------

		if (!subscriptionId) {
			throw new ValidationError(
				"subscriptionId is required"
			);
		}


		if (cycles < 1) {
			throw new ValidationError(
				"cycles must be greater than zero"
			);
		}



		// --------------------------------
		// LOAD SUBSCRIPTION
		// --------------------------------

		const subscription =
			await this.subscriptionRepository.findById(
				subscriptionId
			);


		if (!subscription) {
			throw new NotFoundError(
				"Subscription not found"
			);
		}



		// --------------------------------
		// RESOLVE CURRENT PRICE
		// --------------------------------

		let pricePerCycle = 0;


		if (subscription.planId) {

			const plan =
				await this.planRepository.findById(
					subscription.planId
				);

			if (plan) {
				pricePerCycle = plan.price;
			}
		}


		// fallback to snapshot
		if (!pricePerCycle && subscription.planSnapshot?.price) {
			pricePerCycle =
				subscription.planSnapshot.price;
		}


		const amount =
			pricePerCycle * Number(cycles);



		// --------------------------------
		// CREATE ADMIN PAYMENT RECORD
		// --------------------------------

		const payment =
			await this.adminRecordPaymentUseCase.execute({

				userId: subscription.userId,

				accountId: subscription.accountId,

				planId: subscription.planId,


				amount: {
					base: amount,
					total: amount,
					currency:
						subscription.planSnapshot?.currency ||
						"NGN"
				},


				transactionId:
					reference ||
					`ADM-RENEW-${Date.now()}`,


				adminNote: reason
			});



		// --------------------------------
		// RENEW SUBSCRIPTION
		// --------------------------------

		const updatedSubscription =
			await this.renewSubscriptionUseCase.execute({

				subscriptionId,

				paymentId: payment.id,

				cycles: Number(cycles),

				context
			});



		// --------------------------------
		// RESTORE NETWORK ACCESS
		// --------------------------------

		const activation =
			await this.networkService.resume(
				updatedSubscription,
				context
			);



		return {
			payment,

			subscription: updatedSubscription,

			activation
		};
	}
}