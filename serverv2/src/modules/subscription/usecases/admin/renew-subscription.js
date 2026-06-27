import { ValidationError } from "../../../../shared/errors/validation-error.js";
import { NotFoundError } from "../../../../shared/errors/not-found-error.js";

export class AdminRenewSubscriptionUseCase {
	constructor({
		adminRecordPayment,
		renewSubscription,
		subscriptionRepository,
		planRepository // 🔥 Added Live Plan Repository for up-to-date pricing
	}) {
		this.adminRecordPaymentUseCase = adminRecordPayment;
		this.renewSubscriptionUseCase = renewSubscription;
		this.subscriptionRepository = subscriptionRepository;
		this.planRepository = planRepository;
	}

	async execute({
		subscriptionId,
		cycles = 1,
		reason = "Admin manual bypass renewal",
		reference,
		context = {}
	}) {
		// -----------------------------
		// VALIDATION
		// -----------------------------
		if (!subscriptionId) {
			throw new ValidationError("subscriptionId is required");
		}

		// -----------------------------
		// RESOLVE SUBSCRIPTION
		// -----------------------------
		const subscription = await this.subscriptionRepository.findById(subscriptionId);
		if (!subscription) {
			throw new NotFoundError("Subscription entity not found");
		}

		// -----------------------------
		// 🔥 RESOLVE LIVE PLAN PRICE
		// -----------------------------
		let pricePerCycle = 0;
		
		if (subscription.planId) {
			const livePlan = await this.planRepository.findById(subscription.planId);
			if (livePlan) {
				pricePerCycle = livePlan.price;
			}
		}

		if (!pricePerCycle && subscription.planSnapshot?.price) {
			pricePerCycle = subscription.planSnapshot.price;
		}

		const totalCalculatedAmount = pricePerCycle * Number(cycles);

		// -----------------------------
		// REFERENCE GENERATION
		// -----------------------------
		const finalReference = reference || `ADM-BYP-${Date.now()}`;

		// -----------------------------
		// RECORD BYPASS PAYMENT LOG
		// -----------------------------
		const payment = await this.adminRecordPaymentUseCase.execute({
			userId: subscription.userId,
			accountId: subscription.accountId,
			planId: subscription.planId,
			amount: {
				base: totalCalculatedAmount,
				total: totalCalculatedAmount,
				currency: subscription.planSnapshot?.currency || "NGN"
			},
			transactionId: finalReference,
			adminNote: reason
		});

		// -----------------------------
		// RENEW SUBSCRIPTION LIFECYCLE
		// -----------------------------
		const updatedSubscription = await this.renewSubscriptionUseCase.execute({
			subscriptionId,
			paymentId: payment.id,
			cycles: Number(cycles),
			context
		});

		return {
			payment,
			subscription: updatedSubscription
		};
	}
}
