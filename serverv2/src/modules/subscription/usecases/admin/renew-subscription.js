import { ValidationError } from "../../../../shared/errors/validation-error.js";

export class AdminRenewSubscriptionUseCase {
	constructor({
		adminRecordPaymentUseCase,
		renewSubscriptionUseCase
	}) {
		this.adminRecordPaymentUseCase =
			adminRecordPaymentUseCase;

		this.renewSubscriptionUseCase =
			renewSubscriptionUseCase;
	}

	async execute({
		userId,
		accountId,
		subscriptionId,
		planId,
		amount,
		cycles = 1,
		transactionId, // optional for idempotency
		notes,
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

		if (
			!amount ||
			typeof amount.total !== "number" ||
			amount.total <= 0
		) {
			throw new ValidationError(
				"Invalid payment amount"
			);
		}

		// -----------------------------
		// RECORD PAYMENT
		// -----------------------------

		const payment =
			await this.adminRecordPaymentUseCase.execute({
				userId,
				accountId,
				planId,
				amount,
				transactionId,
				adminNote: notes
			});

		// -----------------------------
		// RENEW SUBSCRIPTION
		// -----------------------------

		const subscription =
			await this.renewSubscriptionUseCase.execute({
				subscriptionId,
				paymentId: payment.id,
				cycles,
				context
			});

		// -----------------------------
		// RESULT
		// -----------------------------

		return {
			payment,
			subscription
		};
	}
}